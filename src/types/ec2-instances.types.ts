export interface DataResponse<T> {
    data: T;
}

export type InstanceStatus = 'stopped' | 'running' | 'pending' | 'stopping' | 'unknown'

export interface Ec2Instance {
  instanceId: string,
  name: string,
  status: InstanceStatus,
  instanceType: string,
  publicIp: string,
  launchTime: string,
}

export type RetrieveEc2InstanceResponse = DataResponse<Ec2Instance>
