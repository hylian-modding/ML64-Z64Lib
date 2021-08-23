export interface IInjectedAssembly{
    Actor_DestroyCave: Buffer;
    Actor_InitCave: Buffer;
    Actor_SpawnCave: Buffer;
    Actor_SpawnTransitionActorCave: Buffer;
    Actor_SpawnEntryCave: Buffer;
    Actor_SpawnWithAddress: Buffer;
    commandbuffer: Buffer;
    Object_SpawnCave: Buffer;
    Actor_UpdateCave: Buffer;
    Sfx_Cave: Buffer;

    VERSIONS: Map<number, Map<string, number>>;
}