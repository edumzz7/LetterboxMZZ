import { useQuery } from '@tanstack/react-query';
import { listUsers } from '../lib/appData';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
  });
}
