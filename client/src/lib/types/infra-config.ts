/**
 * Infrastructure configuration
 */
export interface InfraConfig {
  friendlyStackName: string;
  environment: 'dev' | 'test' | 'prod';  // Match EcsConfig environment options
  ecsTaskRole: boolean;
  provisionCoreVpc: boolean;
  provisionEcsSpoke: boolean;
  provisionEc2Spoke: boolean;
  provisionBorderControlSpoke: boolean;
  bcAdminAdGroup: string;
  vpcProvisioningArtifactName: string;
  bcProvisioningArtifactName: string;
  bcAdminAdGroupDomain: string;
  ec2SpokeProvisioningArtifactName: string;
  ecsSpokeProvisioningArtifactName: string;
  linuxGroup: string;
  windowsGroup: string;
}

/**
 * Internal infrastructure variables
 */
export interface InfraInternalVariables {
  vpcProdId: string;
  ecsProdId: string;
  ec2ProdId: string;
  bcProdId: string;
  roleStackName: string;
  infraStackName: string;
}