import * as Z64API from "../../API/imports";

export class ActorManager implements Z64API.Z64.IActorManager {
    createIActorFromPointer(pointer: number): Z64API.IActor {
        throw new Error("Method not implemented.");
    }
    getActors(category: Z64API.ActorCategory): Z64API.IActor[] {
        throw new Error("Method not implemented.");
    }
}
