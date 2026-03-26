import { useQuery } from '@tanstack/react-query';
import { v2FoldersApi, v2CallsApi, v2EvalsApi } from '../utils/api';

export const v2Keys = {
    folders: (agentId) => ['v2-folders', agentId],
    calls: (folderId) => ['v2-calls', folderId],
    call: (callId) => ['v2-calls', 'detail', callId],
    evals: (folderId) => ['v2-evals', folderId],
    evalByCall: (callId) => ['v2-evals', 'by-call', callId],
    transcriptByCall: (callId) => ['v2-transcripts', 'by-call', callId],
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

export const useV2EvalByCall = (callId) => {
    return useQuery({
        queryKey: v2Keys.evalByCall(callId),
        queryFn: () => v2EvalsApi.getByCall(callId),
        enabled: !!callId,
    });
};

export const useV2TranscriptByCall = (callId) => {
    return useQuery({
        queryKey: v2Keys.transcriptByCall(callId),
        queryFn: () => v2EvalsApi.getTranscriptByCall(callId),
        enabled: !!callId,
    });
};
