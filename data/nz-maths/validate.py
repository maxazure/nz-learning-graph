#!/usr/bin/env python3
"""Validate this supplement with Python 3.10+ and the standard library only.

This implements the JSON Schema keywords used by schema.json, not a general
JSON Schema implementation. It also checks cross-file references and the
combined baseline/proposed hard-dependency DAG. It never edits a repository.
"""
import argparse
import ast
import collections
import csv
import datetime as dt
import hashlib
import heapq
import json
import math
import operator
import pathlib
import re
import sys

def reject_duplicate_keys(pairs):
    out={}
    for k,v in pairs:
        if k in out:raise ValueError('Duplicate JSON object key: '+k)
        out[k]=v
    return out

def load(path):
    return json.loads(path.read_text(encoding='utf-8'),object_pairs_hook=reject_duplicate_keys,
                      parse_constant=lambda x: (_ for _ in ()).throw(ValueError('Non-finite JSON: '+x)))

def schema_errors(value,schema,root,path='$'):
    if '$ref' in schema:
        target=root
        for part in schema['$ref'][2:].split('/'):target=target[part.replace('~1','/').replace('~0','~')]
        return schema_errors(value,target,root,path)
    out=[]
    types={'null':lambda x:x is None,'string':lambda x:isinstance(x,str),
           'integer':lambda x:isinstance(x,int) and not isinstance(x,bool),
           'number':lambda x:isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x),
           'boolean':lambda x:isinstance(x,bool),'array':lambda x:isinstance(x,list),'object':lambda x:isinstance(x,dict)}
    expected=schema.get('type')
    if expected and not any(types[k](value) for k in (expected if isinstance(expected,list) else [expected])):
        return [path+': expected '+str(expected)]
    if 'enum' in schema and value not in schema['enum']:out.append(path+': invalid enum '+repr(value))
    if isinstance(value,str):
        if len(value)<schema.get('minLength',0):out.append(path+': string too short')
        if schema.get('format')=='date':
            try:
                if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',value):raise ValueError()
                dt.date.fromisoformat(value)
            except ValueError:out.append(path+': invalid exact ISO date')
    if isinstance(value,(int,float)) and not isinstance(value,bool):
        if 'minimum' in schema and value<schema['minimum']:out.append(path+': below minimum')
        if 'maximum' in schema and value>schema['maximum']:out.append(path+': above maximum')
    if isinstance(value,list):
        if len(value)<schema.get('minItems',0):out.append(path+': too few items')
        if schema.get('uniqueItems') and len({json.dumps(v,sort_keys=True) for v in value})!=len(value):out.append(path+': duplicate array value')
        for i,v in enumerate(value):out+=schema_errors(v,schema.get('items',{}),root,f'{path}[{i}]')
    if isinstance(value,dict):
        for k in schema.get('required',[]):
            if k not in value:out.append(path+': missing '+k)
        props=schema.get('properties',{})
        extra=schema.get('additionalProperties',True)
        for k,v in value.items():
            if k in props:out+=schema_errors(v,props[k],root,path+'.'+k)
            elif extra is False:out.append(path+': unexpected '+k)
            elif isinstance(extra,dict):out+=schema_errors(v,extra,root,path+'.'+k)
    return out

FUNCTIONS={k:getattr(math,k) for k in ['sqrt','sin','cos','tan','asin','acos','atan','atan2','exp','log','log10','log2','floor','ceil','comb','perm','factorial','erf','erfc','degrees','radians','fsum']}
FUNCTIONS.update(abs=abs,round=round,min=min,max=max,sum=sum,pow=pow,complex=complex)
CONSTANTS={'pi':math.pi,'e':math.e,'tau':math.tau}
BIN={ast.Add:operator.add,ast.Sub:operator.sub,ast.Mult:operator.mul,ast.Div:operator.truediv,ast.FloorDiv:operator.floordiv,ast.Mod:operator.mod,ast.Pow:operator.pow}
def numerical_expression(expression):
    """Evaluate only numeric literals, arithmetic and whitelisted math calls."""
    def name(n):
        if isinstance(n,ast.Name):return n.id
        if isinstance(n,ast.Attribute) and isinstance(n.value,ast.Name) and n.value.id=='math':return n.attr
        raise ValueError('Unsupported function or constant')
    def ev(n):
        if isinstance(n,ast.Expression):return ev(n.body)
        if isinstance(n,ast.Constant) and isinstance(n.value,(int,float)) and not isinstance(n.value,bool):return n.value
        if isinstance(n,ast.UnaryOp) and isinstance(n.op,(ast.USub,ast.UAdd)):return -ev(n.operand) if isinstance(n.op,ast.USub) else ev(n.operand)
        if isinstance(n,ast.BinOp) and type(n.op) in BIN:return BIN[type(n.op)](ev(n.left),ev(n.right))
        if isinstance(n,(ast.Name,ast.Attribute)):
            return CONSTANTS[name(n)]
        if isinstance(n,(ast.List,ast.Tuple)):return [ev(x) for x in n.elts]
        if isinstance(n,ast.Call) and not n.keywords:
            return FUNCTIONS[name(n.func)](*[ev(x) for x in n.args])
        raise ValueError('Expression outside the supported numeric subset: '+ast.dump(n))
    return ev(ast.parse(expression,mode='eval'))

def dag(nodes,edges):
    inc={n:0 for n in nodes}; adj=collections.defaultdict(list)
    for e in edges:
        if e['strength']!='hard':continue
        p,t=e['prerequisite_id'],e['topic_id']
        if p not in inc or t not in inc:continue
        inc[t]+=1;adj[p].append(t)
    ready=[n for n,v in inc.items() if v==0];heapq.heapify(ready);order=[]
    while ready:
        n=heapq.heappop(ready);order.append(n)
        for t in adj[n]:
            inc[t]-=1
            if inc[t]==0:heapq.heappush(ready,t)
    return {'acyclic':len(order)==len(nodes),'ordered_nodes':len(order),'blocked_nodes':sorted(n for n,v in inc.items() if v),
            'topological_order_sha256':hashlib.sha256('\n'.join(order).encode()).hexdigest()}

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('directory',nargs='?',default=str(pathlib.Path(__file__).resolve().parent))
    ap.add_argument('--repo',help='Optional local checkout: check source-file hashes against the researched snapshot')
    ap.add_argument('--output',help='Write results here instead of directory/validation-results.json')
    args=ap.parse_args();root=pathlib.Path(args.directory).resolve();errors=[];warnings=[];checks={};data={}
    for p in sorted(root.glob('*.json')):
        try:data[p.name]=load(p)
        except Exception as e:errors.append(p.name+': '+str(e))
    schema=data.get('schema.json',{})
    required_files=set(schema.get('x-file-schemas',{}))-{'validation-results.json'}
    for filename in sorted(required_files):
        if filename not in data:errors.append('Missing file '+filename);continue
        errors+=schema_errors(data[filename],{'$ref':schema['x-file-schemas'][filename]},schema,filename)
    checks['json_and_schema_fields']={'passed':not errors,'engine':'Standard-library validator for every keyword used by the included schema; not arbitrary JSON Schema.'}
    def records(f):return data.get(f,[])
    def unique(rows,key,label):
        seen=set()
        for row in rows:
            k=row.get(key)
            if k in seen:errors.append('Duplicate '+label+': '+str(k))
            seen.add(k)
        return seen
    new=records('topics.json');enrich=records('topic-enrichments.json');baseline=records('baseline-index.json');all_profiles=new+enrich
    newids=unique(new,'id','new topic ID');enrichids=unique(enrich,'id','enrichment ID');baseids=unique(baseline,'id','baseline ID')
    ids=newids|baseids
    if newids&baseids:errors.append('New IDs already in baseline: '+str(sorted(newids&baseids)))
    if newids&enrichids:errors.append('Same ID both new and enrichment')
    if enrichids-baseids:errors.append('Enrichments lack existing IDs: '+str(sorted(enrichids-baseids)))
    sourceids=unique(records('sources.json'),'source_id','source ID')
    standardids=unique(records('standards.json'),'standard_id','standard ID')
    frameworkids=unique(records('curriculum-frameworks.json'),'framework_id','framework ID')
    mappingids=unique(records('curriculum-mappings.json'),'id','mapping ID')
    unique(records('curriculum-requirements.json'),'requirement_id','requirement ID')
    def refs(v,path):
        if isinstance(v,dict):
            for k,x in v.items():
                if k=='null_reasons':continue
                if k in ['topic_id','prerequisite_id','existing_topic_id','existing_prerequisite_id','proposed_prerequisite_id','proposed_topic_id','preferred_reuse_id'] and x is not None and x not in ids:errors.append(path+'.'+k+': unknown topic '+str(x))
                if k in ['topic_ids','candidate_existing_ids'] and isinstance(x,list):
                    for tid in x:
                        if tid not in ids:errors.append(path+'.'+k+': unknown topic '+str(tid))
                if k=='source_id' and x not in sourceids:errors.append(path+': unknown source '+str(x))
                if k=='source_ids' and isinstance(x,list):
                    for sid in x:
                        if sid not in sourceids:errors.append(path+': unknown source '+str(sid))
                if k=='standard_id' and x is not None and x not in standardids:errors.append(path+': unknown standard '+str(x))
                if k=='standard_ids' and isinstance(x,list):
                    for sid in x:
                        if sid not in standardids:errors.append(path+': unknown standard '+str(sid))
                if k in ['mapping_ids','curriculum_mapping_ids'] and isinstance(x,list):
                    for mid in x:
                        if mid not in mappingids:errors.append(path+': unknown mapping '+str(mid))
                if k=='framework' and x not in frameworkids:errors.append(path+': unknown framework '+str(x))
                if k=='framework_ids' and isinstance(x,list):
                    for fid in x:
                        if fid not in frameworkids:errors.append(path+': unknown framework '+str(fid))
                refs(x,path+'.'+k)
        elif isinstance(v,list):
            for i,x in enumerate(v):refs(x,f'{path}[{i}]')
    for fn,x in data.items():
        if fn not in ['schema.json','validation-results.json']:refs(x,fn)
    mapped_by_topic=collections.defaultdict(list)
    for m in records('curriculum-mappings.json'):mapped_by_topic[m['topic_id']].append(m)
    for t in all_profiles:
        expected_mapping_ids={m['id'] for m in mapped_by_topic[t['id']]}
        if set(t.get('curriculum_mapping_ids',[]))!=expected_mapping_ids:errors.append(t['id']+': stale or misassigned curriculum_mapping_ids cache')
        expected_standard_ids={m['standard_id'] for m in mapped_by_topic[t['id']] if m['standard_id']}
        if set(t['standard_ids'])!=expected_standard_ids:errors.append(t['id']+': stale or misassigned standard_ids cache')
    standard_lookup={s['standard_id']:s for s in records('standards.json')}
    deps=records('dependencies.json');baseedges=records('baseline-dependencies.json');seen=set()
    for e in deps:
        pair=e['prerequisite_id'],e['topic_id']
        if pair[0]==pair[1]:errors.append('Self dependency: '+str(pair))
        if pair in seen:errors.append('Repeated dependency pair: '+str(pair))
        seen.add(pair)
        if e['basis']=='source_explicit' and (not e['source_ids'] or not e['source_locators']):errors.append('Explicit edge lacks located evidence: '+str(pair))
    mapping_keys=set()
    for m in records('curriculum-mappings.json'):
        key=tuple(m.get(k) for k in ['topic_id','framework','year_or_phase','qualification_level','curriculum_level','standard_id','status','effective_from','effective_to'])
        if key in mapping_keys:errors.append('Duplicate semantic mapping: '+str(key))
        mapping_keys.add(key)
        if m['standard_id'] in standard_lookup:
            st=standard_lookup[m['standard_id']]
            if m['qualification_level']!=st['qualification_level']:errors.append(m['id']+': qualification level disagrees with standard registry')
            if m['standard_title']!=st['standard_title']:errors.append(m['id']+': title disagrees with standard registry')
            if m.get('standard_version') is not None and m['standard_version']!=st['version']:errors.append(m['id']+': version disagrees with standard registry')
        for field in ['year_or_phase','qualification_level','standard_id','standard_title','effective_from','effective_to']:
            if m.get(field) is None and not m['null_reasons'].get(field):errors.append(m['id']+': unexplained null '+field)
        if m['framework']=='NZC_2025_Y0_10' and (m['effective_from']!='2026-01-01' or m['qualification_level'] is not None):errors.append('Foundation framework/date conflation: '+m['id'])
        if m['framework']=='NZC_2007_L6_8' and m.get('curriculum_level') not in [6,7,8]:errors.append('Invalid senior curriculum level: '+m['id'])
        if m['framework'].startswith('NZC_') and m['standard_id'] is not None:errors.append('Curriculum row embeds an assessment ID: '+m['id'])
        if m['framework']=='NCEA_current' and m['qualification_level'] not in [1,2,3]:errors.append('Invalid NCEA qualification level: '+m['id'])
        if m['status']=='current' and m['effective_from'] and m['effective_from']>'2026-10-18':errors.append('Future content labelled current: '+m['id'])
        if m['standard_id']=='91947':
            t=next((x for x in all_profiles if x['id']==m['topic_id']),None)
            if t and t['domain']=='Probability':errors.append('Probability incorrectly mapped to 2026 AS91947: '+m['topic_id'])
    expected_as={str(x) for x in range(91944,91948)}|{str(x) for x in range(91256,91270)}|{str(x) for x in range(91573,91588)}
    actual_as={x['standard_id'] for x in records('standards.json') if x['standard_type']=='achievement_standard'}
    if expected_as!=actual_as:errors.append('Current AS catalogue mismatch: missing '+str(sorted(expected_as-actual_as))+' extra '+str(sorted(actual_as-expected_as)))
    expected_external={'91946','91947','91261','91262','91267','91577','91578','91579','91584','91585','91586'}
    actual_external={x['standard_id'] for x in records('standards.json') if x['standard_type']=='achievement_standard' and x['assessment_type']=='external'}
    if expected_external!=actual_external:errors.append('External achievement-standard catalogue mismatch: '+str(sorted(expected_external ^ actual_external)))
    basepairs={(e['prerequisite_id'],e['topic_id']):e for e in baseedges}
    amendments={(e['prerequisite_id'],e['topic_id']) for e in data.get('merge-plan.json',{}).get('existing_dependency_changes',[])}
    combined=dict(basepairs)
    for e in deps:
        p=e['prerequisite_id'],e['topic_id']
        if p in basepairs and e['strength']!=basepairs[p]['strength'] and p not in amendments:errors.append('Undocumented baseline strength change: '+str(p))
        combined[p]=e
    checks['baseline_hard_dag']=dag(baseids,baseedges)
    checks['supplement_hard_dag']=dag(ids,deps)
    checks['combined_hard_dag']=dag(ids,list(combined.values()))
    for k in ['baseline_hard_dag','supplement_hard_dag','combined_hard_dag']:
        if not checks[k]['acyclic']:errors.append(k+': cycle or cycle-dependent nodes '+str(checks[k]['blocked_nodes']))
    foundation={m['topic_id'] for m in records('curriculum-mappings.json') if m['framework']=='NZC_2025_Y0_10'}
    senior={m['topic_id'] for m in records('curriculum-mappings.json') if m['framework'] in ['NZC_2007_L6_8','NCEA_current']} & {t['id'] for t in all_profiles}
    parents=collections.defaultdict(set);allparents=collections.defaultdict(set)
    for e in combined.values():
        allparents[e['topic_id']].add(e['prerequisite_id'])
        if e['strength']=='hard':parents[e['topic_id']].add(e['prerequisite_id'])
    def reaches(start,lookup):
        todo=[start];visited=set()
        while todo:
            n=todo.pop()
            if n in visited:continue
            visited.add(n)
            if n in foundation:return True
            todo.extend(lookup[n]-visited)
        return False
    lacking_hard=sorted(t for t in senior if not reaches(t,parents))
    lacking_any=sorted(t for t in senior if not reaches(t,allparents))
    checks['senior_foundation_paths']={'senior_profile_count':len(senior),'has_hard_path_or_foundation_mapping':len(senior)-len(lacking_hard),'without_hard_path':lacking_hard,'without_any_path':lacking_any,'interpretation':'Explicit current Years 0–10 mappings anchor paths. A hard path is mathematical readiness evidence, not an official fixed grade sequence.'}
    if lacking_any:warnings.append('Senior profiles without any path to a mapped Years 0–10 anchor: '+', '.join(lacking_any))
    numeric=[]
    for c in records('math-checks.json'):
        try:
            result=numerical_expression(c['expression']);passed=math.isfinite(result) and abs(result-c['expected'])<=c['tolerance']
            numeric.append({'topic_id':c['topic_id'],'expression':c['expression'],'actual':result,'expected':c['expected'],'passed':passed})
            if not passed:errors.append('Numeric check failed: '+c['topic_id']+' '+c['expression'])
        except Exception as exc:errors.append('Numeric check error: '+c['topic_id']+': '+str(exc))
    checks['numeric_examples']={'passed':all(c['passed'] for c in numeric) and len(numeric)==len(records('math-checks.json')),'check_count':len(numeric),'distinct_topics':len({c['topic_id'] for c in numeric}),'results':numeric,'limitation':'Checks explicitly listed computations, not every qualitative interpretation, all symbolic identities, or official assessment validity.'}
    coverage=[]
    try:
        with (root/'coverage-matrix.csv').open(encoding='utf-8',newline='') as f:coverage=list(csv.DictReader(f))
        for i,row in enumerate(coverage):
            tids=[x for x in row['topic_ids'].split(';') if x]
            if int(row['topic_count'])!=len(set(tids)):errors.append('Coverage row count mismatch: '+str(i+2))
            for tid in tids:
                if tid not in ids:errors.append('Coverage unknown topic: '+tid)
            for sid in row['source_ids'].split(';'):
                if sid and sid not in sourceids:errors.append('Coverage unknown source: '+sid)
            for fid in row['framework_ids'].split(';'):
                if fid not in frameworkids:errors.append('Coverage unknown framework: '+fid)
        for y in [11,12,13]:
            if not any(r['year_or_phase']=='Year '+str(y) for r in coverage):errors.append('Missing separate senior year coverage: '+str(y))
    except Exception as exc:errors.append('coverage-matrix.csv: '+str(exc))
    checks['coverage_matrix']={'rows':len(coverage),'statuses':dict(collections.Counter(r.get('coverage_status') for r in coverage))}
    if args.repo:
        mismatches=[]
        for f in data.get('repository-snapshot.json',{}).get('files',[]):
            path=pathlib.Path(args.repo)/f['path']
            if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest()!=f['sha256']:mismatches.append(f['path'])
        checks['optional_repository_comparison']={'matching_snapshot':not mismatches,'different_or_missing_files':mismatches}
        if mismatches:warnings.append('Target checkout differs from the researched snapshot; re-run semantic review before merging: '+', '.join(mismatches))
    counts={'new_topics':len(new),'enriched_existing_topics':len(enrich),'baseline_topics':len(baseline),'supplement_dependencies':len(deps),'hard_dependencies':sum(e['strength']=='hard' for e in deps),'helpful_dependencies':sum(e['strength']=='helpful' for e in deps),'baseline_dependencies':len(baseedges),'combined_dependencies':len(combined),'curriculum_mappings':len(records('curriculum-mappings.json')),'mapped_topic_ids':len({m['topic_id'] for m in records('curriculum-mappings.json')}),'sources':len(records('sources.json')),'achievement_standards':len(actual_as),'unit_standards':len(standardids-actual_as),'curriculum_requirement_rows':len(records('curriculum-requirements.json')),'numeric_checks':len(numeric)}
    checks['references_ids_edge_and_mapping_invariants']={'passed':not errors}
    result={'executed_at':dt.datetime.now(dt.timezone.utc).isoformat(),'research_as_of':'2026-10-18','python_version':sys.version.split()[0],'checks':checks,'counts':counts,'errors':errors,'warnings':warnings,'passed':not errors}
    output=pathlib.Path(args.output) if args.output else root/'validation-results.json'
    output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'passed':not errors,'counts':counts,'errors':errors,'warnings':warnings},ensure_ascii=False,indent=2))
    return 0 if not errors else 1

if __name__=='__main__':raise SystemExit(main())
