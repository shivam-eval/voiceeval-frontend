import { useQuery } from '@tanstack/react-query';
import { v2FoldersApi, v2CallsApi, v2EvalsApi } from '../utils/api';

export const v2Keys = {
    folders: (agentId) => ['v2-folders', agentId],
    calls: (folderId) => ['v2-calls', folderId],
    call: (callId) => ['v2-calls', 'detail', callId],
    evals: (folderId) => ['v2-evals', folderId],
    eval: (evalId) => ['v2-evals', 'detail', evalId],
    evalByCall: (callId) => ['v2-evals', 'by-call', callId],
};

export const useV2Folders = (agentId) => {
    return useQuery({
        queryKey: v2Keys.folders(agentId),
        queryFn: () => v2FoldersApi.listByAgent(agentId),
        enabled: !!agentId,
        staleTime: 30000,
    });
};

export const useV2Calls = (folderId) => {
    return useQuery({
        queryKey: v2Keys.calls(folderId),
        queryFn: () => v2CallsApi.listByFolder(folderId),
        enabled: !!folderId,
        staleTime: 30000,
    });
};

export const useV2Evals = (folderId) => {
    return useQuery({
        queryKey: v2Keys.evals(folderId),
        queryFn: () => v2EvalsApi.listByFolder(folderId),
        enabled: !!folderId,
        staleTime: 30000,
    });
};

export const useV2Eval = (evalId) => {
    return useQuery({
        queryKey: v2Keys.eval(evalId),
        queryFn: () => v2EvalsApi.get(evalId),
        enabled: !!evalId,
    });
};

export const useV2EvalByCall = (callId) => {
    return useQuery({
        queryKey: v2Keys.evalByCall(callId),
        queryFn: () => v2EvalsApi.getByCall(callId),
        enabled: !!callId,
    });
};
