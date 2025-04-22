import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProvisioning } from "@/context/provisioning-context";
import AwsCredentialForm from "@/components/aws-credential-form";
import InfraConfigurationForm from "@/components/infra-configuration-form";
import ActivityMonitor from "@/components/ui/activity-monitor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { infraSteps } from "@/lib/infra-service-utils";
import InfraWorkflow from "@/components/workflow/InfraWorkflow";

const InfraDashboard: React.FC = () => {
  const [_, navigate] = useLocation();
  const { 
    provisioningState, 
    isLoading, 
    awsCredentials, 
    ecsConfig, 
    updateAwsCredentials, 
    updateEcsConfig, 
    startProvisioningProcess 
  } = useProvisioning();
  
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [formStep, setFormStep] = useState<number>(0);
  
  // Get the current status of provisioning
  const status = provisioningState.status || "pending";
  const isComplete = status === "completed";
  const isFailed = status === "failed";
  const isInProgress = status === "in-progress";
  const hasStarted = isInProgress || isComplete || isFailed;
  
  // Format current step for display
  const currentStepId = provisioningState.currentStep;
  const currentStep = infraSteps.find(step => step.id === currentStepId);
  const currentStepName = currentStep ? currentStep.title : "Not started";
  
  // When provisioning starts, switch to the activity tab
  useEffect(() => {
    if (isInProgress) {
      setActiveTab("activity");
    }
  }, [isInProgress]);
  
  // Handle back button
  const handleBack = () => {
    navigate("/");
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formStep === 0) {
      // Move to the next step if AWS credentials are filled
      if (awsCredentials.username && awsCredentials.password) {
        setFormStep(1);
      }
    } else {
      // Start provisioning process
      try {
        await startProvisioningProcess();
        setActiveTab("activity");
      } catch (error) {
        console.error("Error starting provisioning:", error);
      }
    }
  };
  
  // Handle going back in the form
  const handleFormBack = () => {
    setFormStep(0);
  };
  
  // Handle credential form next button
  const handleCredentialNext = () => {
    setFormStep(1);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Infrastructure Provisioning
          </h1>
          <p className="text-gray-600">
            Provision infrastructure using AWS Service Catalog
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity" disabled={!hasStarted}>
            Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {formStep === 0
                      ? "AWS Authentication"
                      : "Infrastructure Configuration"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasStarted ? (
                    <form onSubmit={handleSubmit}>
                      {formStep === 0 ? (
                        <AwsCredentialForm
                          disabled={isLoading || hasStarted}
                          onNext={handleCredentialNext}
                        />
                      ) : (
                        <InfraConfigurationForm
                          onSubmit={handleSubmit}
                          disabled={isLoading || hasStarted}
                          onBack={handleFormBack}
                        />
                      )}
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <Alert
                        variant={
                          isComplete
                            ? "default"
                            : isFailed
                            ? "destructive"
                            : "default"
                        }
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isFailed ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        )}
                        <AlertTitle>
                          {isComplete
                            ? "Provisioning Complete"
                            : isFailed
                            ? "Provisioning Failed"
                            : "Provisioning in Progress"}
                        </AlertTitle>
                        <AlertDescription>
                          {isComplete
                            ? "Your infrastructure has been successfully provisioned."
                            : isFailed
                            ? "There was an error during the provisioning process."
                            : `Current step: ${currentStepName}`}
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium">Configuration Details</h3>
                        <div className="text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-gray-500">Application Name</div>
                            <div>{ecsConfig.applicationName}</div>
                            
                            <div className="text-gray-500">Environment</div>
                            <div className="capitalize">{ecsConfig.environment}</div>
                          </div>
                        </div>
                      </div>
                      
                      {(isComplete || isFailed) && (
                        <div className="pt-4">
                          <Button onClick={() => navigate("/")} className="mr-2">
                            Back to Dashboard
                          </Button>
                          
                          {isFailed && (
                            <Button
                              variant="outline"
                              onClick={() => setActiveTab("activity")}
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Activity Monitor Card moved to the bottom */}
              {hasStarted && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Provisioning Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityMonitor
                      logs={provisioningState.logs || []}
                      status={provisioningState.status || "pending"}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Infrastructure Workflow</CardTitle>
                </CardHeader>
                <CardContent>
                  <InfraWorkflow
                    steps={infraSteps}
                    currentStep={currentStepId}
                    status={status}
                  />
                </CardContent>
              </Card>
              
              {/* Service Catalog Info Card moved below workflow */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>About Service Catalog</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  <p>
                    AWS Service Catalog allows you to centrally manage commonly deployed infrastructure and applications.
                  </p>
                  
                  <p>
                    Service Catalog products used:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>core-vpc</li>
                    <li>ecs-spoke</li>
                    <li>ec2-spoke</li>
                    <li>border-controls-spoke</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Provisioning Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityMonitor
                logs={provisioningState.logs || []}
                status={provisioningState.status || "pending"}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfraDashboard;