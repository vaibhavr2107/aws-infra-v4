import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProvisioning } from "@/context/provisioning-context";
import { ArrowLeft } from "lucide-react";

const infraFormSchema = z.object({
  friendlyStackName: z.string().min(3, {
    message: "Stack name must be at least 3 characters",
  }).refine(value => /^[a-zA-Z0-9-]+$/.test(value), {
    message: "Stack name can only contain letters, numbers, and hyphens"
  }),
  applicationName: z.string().min(3, {
    message: "Application name must be at least 3 characters",
  }).refine(value => /^[a-zA-Z0-9-]+$/.test(value), {
    message: "Application name can only contain letters, numbers, and hyphens"
  }),
  environment: z.enum(["dev", "test", "prod"], {
    required_error: "Please select an environment",
  }),
  ecsTaskRole: z.boolean().default(false),
  provisionCoreVpc: z.boolean().default(true),
  provisionEcsSpoke: z.boolean().default(true),
  provisionEc2Spoke: z.boolean().default(true),
  provisionBorderControlSpoke: z.boolean().default(true),
  bcAdminAdGroup: z.string().min(3, {
    message: "Admin group name must be at least 3 characters",
  }),
  vpcProvisioningArtifactName: z.string().min(1, {
    message: "VPC artifact name is required",
  }),
  bcProvisioningArtifactName: z.string().min(1, {
    message: "Border controls artifact name is required",
  }),
  bcAdminAdGroupDomain: z.string().min(3, {
    message: "Admin group domain must be at least 3 characters",
  }),
  ec2SpokeProvisioningArtifactName: z.string().min(1, {
    message: "EC2 spoke artifact name is required",
  }),
  ecsSpokeProvisioningArtifactName: z.string().min(1, {
    message: "ECS spoke artifact name is required",
  }),
  linuxGroup: z.string().min(3, {
    message: "Linux group name must be at least 3 characters",
  }),
  windowsGroup: z.string().min(3, {
    message: "Windows group name must be at least 3 characters",
  }),
});

type InfraFormValues = z.infer<typeof infraFormSchema>;

interface InfraConfigurationFormProps {
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  onBack?: () => void;
}

export default function InfraConfigurationForm({
  onSubmit,
  disabled = false,
  onBack,
}: InfraConfigurationFormProps) {
  const { ecsConfig, infraConfig, updateEcsConfig, updateInfraConfig } = useProvisioning();

  // Internal pipeline variables defaults
  const defaultValues: Partial<InfraFormValues> = {
    friendlyStackName: infraConfig?.friendlyStackName || "aws-infrastructure",
    environment: infraConfig?.environment || 
      ((ecsConfig.environment === "dev" || ecsConfig.environment === "test" || ecsConfig.environment === "prod") 
        ? ecsConfig.environment 
        : "dev"),
    ecsTaskRole: true,
    provisionCoreVpc: true,
    provisionEcsSpoke: true,
    provisionEc2Spoke: true,
    provisionBorderControlSpoke: true,
    bcAdminAdGroup: "AWS-SC-Admin-Group",
    vpcProvisioningArtifactName: "v1.0",
    bcProvisioningArtifactName: "v1.0",
    bcAdminAdGroupDomain: "example.com",
    ec2SpokeProvisioningArtifactName: "v1.0",
    ecsSpokeProvisioningArtifactName: "v1.0",
    linuxGroup: "LinuxAdmins",
    windowsGroup: "WindowsAdmins",
  };

  const form = useForm<InfraFormValues>({
    resolver: zodResolver(infraFormSchema),
    defaultValues,
  });

  async function handleSubmitForm(values: InfraFormValues) {
    console.log('Form submitted with values:', values);
    try {
      // Store detailed infrastructure values in the Infra config context only
      await updateInfraConfig({
        friendlyStackName: values.friendlyStackName,
      environment: values.environment,
      ecsTaskRole: values.ecsTaskRole,
      provisionCoreVpc: values.provisionCoreVpc,
      provisionEcsSpoke: values.provisionEcsSpoke,
      provisionEc2Spoke: values.provisionEc2Spoke,
      provisionBorderControlSpoke: values.provisionBorderControlSpoke,
      bcAdminAdGroup: values.bcAdminAdGroup,
      vpcProvisioningArtifactName: values.vpcProvisioningArtifactName,
      bcProvisioningArtifactName: values.bcProvisioningArtifactName,
      bcAdminAdGroupDomain: values.bcAdminAdGroupDomain,
      ec2SpokeProvisioningArtifactName: values.ec2SpokeProvisioningArtifactName,
      ecsSpokeProvisioningArtifactName: values.ecsSpokeProvisioningArtifactName,
      linuxGroup: values.linuxGroup,
      windowsGroup: values.windowsGroup,
    });

      // Submit the form and pass the form event
      if (onSubmit) {
        onSubmit(new Event("submit") as unknown as React.FormEvent);
      }
    } catch (error) {
      console.error('Error updating infra config:', error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className="space-y-6"
      >
        {/* Back button */}
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={onBack}
            disabled={disabled}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AWS Credentials
          </Button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stack Name */}
          <FormField
            control={form.control}
            name="friendlyStackName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stack Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter a friendly name for your stack"
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A descriptive name for your infrastructure stack
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Environment */}
          <FormField
            control={form.control}
            name="environment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Environment</FormLabel>
                <Select
                  disabled={disabled}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dev">Development</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="prod">Production</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The environment where infrastructure will be deployed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Infrastructure Components</h3>

          {/* ECS Task Role */}
          <FormField
            control={form.control}
            name="ecsTaskRole"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Provision ECS Task Role</FormLabel>
                  <FormDescription>
                    Create IAM role for ECS tasks
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Provision Core VPC */}
          <FormField
            control={form.control}
            name="provisionCoreVpc"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Provision Core VPC</FormLabel>
                  <FormDescription>
                    Create a new Virtual Private Cloud
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Provision ECS Spoke */}
          <FormField
            control={form.control}
            name="provisionEcsSpoke"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Provision ECS Spoke</FormLabel>
                  <FormDescription>
                    Create ECS cluster infrastructure
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Provision EC2 Spoke */}
          <FormField
            control={form.control}
            name="provisionEc2Spoke"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Provision EC2 Spoke</FormLabel>
                  <FormDescription>
                    Create EC2 instance infrastructure
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Provision Border Control Spoke */}
          <FormField
            control={form.control}
            name="provisionBorderControlSpoke"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Provision Border Control Spoke</FormLabel>
                  <FormDescription>
                    Create network security controls
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Advanced Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BC Admin AD Group */}
            <FormField
              control={form.control}
              name="bcAdminAdGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Border Controls Admin Group</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Admin group name"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BC Admin AD Group Domain */}
            <FormField
              control={form.control}
              name="bcAdminAdGroupDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Group Domain</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example.com"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* VPC Provisioning Artifact Name */}
            <FormField
              control={form.control}
              name="vpcProvisioningArtifactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VPC Artifact Version</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="v1.0"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BC Provisioning Artifact Name */}
            <FormField
              control={form.control}
              name="bcProvisioningArtifactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Border Controls Artifact Version</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="v1.0"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EC2 Spoke Provisioning Artifact Name */}
            <FormField
              control={form.control}
              name="ec2SpokeProvisioningArtifactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EC2 Spoke Artifact Version</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="v1.0"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ECS Spoke Provisioning Artifact Name */}
            <FormField
              control={form.control}
              name="ecsSpokeProvisioningArtifactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ECS Spoke Artifact Version</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="v1.0"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Linux Group */}
            <FormField
              control={form.control}
              name="linuxGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linux Access Group</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="LinuxAdmins"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Windows Group */}
            <FormField
              control={form.control}
              name="windowsGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Windows Access Group</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="WindowsAdmins"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={disabled}>
            Start Provisioning
          </Button>
        </div>
      </form>
    </Form>
  );
}