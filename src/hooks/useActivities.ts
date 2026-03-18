import { useQuery } from '@tanstack/react-query';
import { listActivities } from '../lib/appData';

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => listActivities(25),
  });
}
