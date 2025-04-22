import { 
  users, 
  type User, 
  type InsertUser,
  type AwsCredentials,
  type InsertAwsCredentials, 
  type ProvisioningState,
  type InsertProvisioningState
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // AWS credentials operations
  storeAwsCredentials(credentials: InsertAwsCredentials): Promise<AwsCredentials>;
  getAwsCredentialsByUserId(userId: number): Promise<AwsCredentials | undefined>;
  
  // Provisioning state operations
  createProvisioningState(state: InsertProvisioningState): Promise<ProvisioningState>;
  getProvisioningState(id: number): Promise<ProvisioningState | undefined>;
  getLatestProvisioningState(): Promise<ProvisioningState | undefined>;
  updateProvisioningState(id: number, updates: Partial<ProvisioningState>): Promise<ProvisioningState>;
  addProvisioningLog(id: number, logMessage: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private awsCredentials: Map<number, AwsCredentials>;
  private provisioningStates: Map<number, ProvisioningState>;
  private userIdCounter: number;
  private credentialsIdCounter: number;
  private provisioningStateIdCounter: number;

  constructor() {
    this.users = new Map();
    this.awsCredentials = new Map();
    this.provisioningStates = new Map();
    this.userIdCounter = 1;
    this.credentialsIdCounter = 1;
    this.provisioningStateIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // AWS credentials operations
  async storeAwsCredentials(insertCredentials: InsertAwsCredentials): Promise<AwsCredentials> {
    const id = this.credentialsIdCounter++;
    const credentials: AwsCredentials = { ...insertCredentials, id };
    this.awsCredentials.set(id, credentials);
    return credentials;
  }
  
  async getAwsCredentialsByUserId(userId: number): Promise<AwsCredentials | undefined> {
    return Array.from(this.awsCredentials.values()).find(
      (creds) => creds.userId === userId,
    );
  }
  
  // Provisioning state operations
  async createProvisioningState(insertState: InsertProvisioningState): Promise<ProvisioningState> {
    const id = this.provisioningStateIdCounter++;
    const state: ProvisioningState = { ...insertState, id };
    this.provisioningStates.set(id, state);
    return state;
  }
  
  async getProvisioningState(id: number): Promise<ProvisioningState | undefined> {
    return this.provisioningStates.get(id);
  }
  
  async getLatestProvisioningState(): Promise<ProvisioningState | undefined> {
    if (this.provisioningStates.size === 0) return undefined;
    
    // Get all states and sort by ID (assuming higher ID = more recent)
    const states = Array.from(this.provisioningStates.values());
    states.sort((a, b) => b.id - a.id);
    
    return states[0];
  }
  
  async updateProvisioningState(id: number, updates: Partial<ProvisioningState>): Promise<ProvisioningState> {
    const currentState = this.provisioningStates.get(id);
    
    if (!currentState) {
      throw new Error(`Provisioning state with ID ${id} not found`);
    }
    
    const updatedState = { ...currentState, ...updates };
    this.provisioningStates.set(id, updatedState);
    
    return updatedState;
  }
  
  async addProvisioningLog(id: number, logMessage: string): Promise<void> {
    const state = this.provisioningStates.get(id);
    
    if (!state) {
      throw new Error(`Provisioning state with ID ${id} not found`);
    }
    
    const timestamp = new Date().toLocaleTimeString();
    const newLog = { timestamp, message: logMessage };
    
    let logs = Array.isArray(state.logs) ? [...state.logs] : [];
    logs.push(newLog);
    
    await this.updateProvisioningState(id, { 
      logs,
      updatedAt: new Date().toISOString()
    });
  }
}

export const storage = new MemStorage();
