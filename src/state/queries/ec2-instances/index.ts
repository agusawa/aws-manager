import { RetrieveEc2InstanceResponse } from '@/types/ec2-instances.types';
import { useMutation, useQuery } from "@tanstack/react-query";
import { QueryFn } from "../query-fn";
import { queryClient } from '@/lib/react-query';

const ec2InstancesQueryKeyRoot = 'ec2Instances';
export const ec2InstancesQueryKeys = [ec2InstancesQueryKeyRoot]

export function useRetrieveEc2InstanceQuery(instanceId: string) {
  return useQuery({
    queryKey: [ec2InstancesQueryKeyRoot, instanceId],
    queryFn: () => QueryFn.get(`/api/ec2-instances/${instanceId}`).then((res) => res.data as RetrieveEc2InstanceResponse)
  })
} 

export function useStartEc2InstanceMutation() {
  return useMutation({
    mutationFn: (instanceId: string) => QueryFn.post(`/api/ec2-instances/${instanceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ec2InstancesQueryKeys })
    }
  })
}

export function useStopEc2InstanceMutation() {
  return useMutation({
    mutationFn: (instanceId: string) => QueryFn.delete(`/api/ec2-instances/${instanceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ec2InstancesQueryKeys })
    }
  })
}
