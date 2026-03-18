import { useQuery } from '@tanstack/react-query';
import { listRankedUsers } from '../lib/appData';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: listRankedUsers,
  });
}
