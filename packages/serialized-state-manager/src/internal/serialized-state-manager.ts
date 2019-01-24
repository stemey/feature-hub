import {SerializedStateManagerV0} from '..';
import {ClientSideStateManager} from './client-side-state-manager';
import {ServerSideStateManager} from './server-side-state-manager';

export class SerializedStateManager implements SerializedStateManagerV0 {
  public constructor(
    private readonly consumerUid: string,
    private readonly serverSideStateManager: ServerSideStateManager,
    private readonly clientSideStateManager: ClientSideStateManager
  ) {}

  public register(serializeState: () => string): void {
    this.serverSideStateManager.register(this.consumerUid, serializeState);
  }

  public serializeStates(): string {
    return this.serverSideStateManager.serializeStates();
  }

  public setSerializedStates(serializedStates: string): void {
    this.clientSideStateManager.setSerializedStates(serializedStates);
  }

  public getSerializedState(): string | undefined {
    return this.clientSideStateManager.getSerializedState(this.consumerUid);
  }
}