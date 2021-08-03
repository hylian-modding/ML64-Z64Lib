import { IActorDeathFile, ActorDeathBehavior } from '../../Common/Actor';

export class En_Dekubaba implements IActorDeathFile {
  id = 0x55;
  death: ActorDeathBehavior = new ActorDeathBehavior(0x1b0, 0x2750);
}
