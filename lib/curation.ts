import review from '../data/maths-curation.json';

export const mathsCuration = review;
const mergedIds = new Map(review.merges.map(m => [m.from_id, m.to_id]));
// Used only while assembling the current dataset, not as a public ID redirect.
export function canonicalTopicId(id:string) { return mergedIds.get(id) || id; }
export function canonicalTopicIds(ids:string[]) { return [...new Set(ids.map(canonicalTopicId))]; }
export function sourceTopicIds(id:string) { return [id, ...review.merges.filter(m => m.to_id === id).map(m => m.from_id)]; }
export function topicPatch(id:string) { return review.topic_patches.find(p => p.id === id); }
