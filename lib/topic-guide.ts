import type {Topic} from './graph';

/** Prefer the scoped teaching profile while retaining original source text on the topic. */
export function topicGuide(topic:Topic,year:number|null=null){
 const profile=topic.teaching;
 const diagnostic=year===null?profile?.diagnostic_questions[0]
  :profile?.diagnostic_questions.find(q=>q.applicability.years.includes(year));
 return {
  domain:profile?.domain||topic.domain,
  description:profile?.description||topic.description,
  evidence:profile?.understanding_evidence.length?profile.understanding_evidence:topic.evidence,
  question:diagnostic?.question||(profile?null:topic.assessmentPrompt),
  questionYears:diagnostic?.applicability.years||[],
 };
}
