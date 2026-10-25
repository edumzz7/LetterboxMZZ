import type { ActivityEntry } from '../types/app';

export function activityDestination(activity: ActivityEntry): string | null {
  const member = activity.message.match(/^Novo membro! @([\w.-]+)/)?.[1];
  return member ? `/${member}` : null;
}
