import { getEntities, updateEntity } from './client';

export async function fetchFacturen(filters = {}) {
  return getEntities('Factuur', filters);
}

export async function updateFactuur(entityId, updateData) {
  return updateEntity('Factuur', entityId, updateData);
}