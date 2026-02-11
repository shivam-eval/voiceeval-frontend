import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  Box,
  Zap,
  Database,
  ArrowLeft,
  X,
  Info
} from 'lucide-react';

// Mock trace data for demonstration
const MOCK_TRACE_DATA = {
  "trace": {
    "id": "675a4453e2713dec0017418edf2d9787",
    "projectId": "cmkme4iwh00qnad079j0kakep",
    "name": "job_entrypoint",
    "timestamp": "2026-02-03T13:30:50.306Z",
    "environment": "default",
    "tags": [],
    "bookmarked": false,
    "release": null,
    "version": null,
    "userId": null,
    "sessionId": null,
    "public": false,
    "input": null,
    "output": null,
    "createdAt": "2026-02-03T13:30:54.000Z",
    "updatedAt": "2026-02-03T13:31:07.768Z",
    "metadata": "{\"attributes\":{\"lk.job_id\":\"fake-job-e6b9e88ca676\",\"lk.agent_name\":\"\",\"lk.room_name\":\"console-room\"},\"resourceAttributes\":{\"telemetry.sdk.language\":\"python\",\"telemetry.sdk.name\":\"opentelemetry\",\"telemetry.sdk.version\":\"1.39.1\",\"service.name\":\"unknown_service\",\"voiceeval.tenant.email\":\"admin@voiceeval.com\",\"tenant.id\":\"admin@voiceeval.com\"},\"scope\":{\"name\":\"livekit-agents\",\"attributes\":{}}}",
    "scores": [],
    "corrections": [],
    "latency": 14.148,
    "observations": [
      {
        "id": "144bd623d8a87d73",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:50.306Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": null,
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:31:04.454Z",
        "name": "start_agent_activity",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 14.148,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "eccf2a7ed58c3ec1",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:50.382Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "144bd623d8a87d73",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:31:04.454Z",
        "name": "agent_session",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 14.072,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "5e3f2d1a9b8c7e6d",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:51.500Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "eccf2a7ed58c3ec1",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:30:54.234Z",
        "name": "user_turn",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 2.734,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "9a7b6c5d4e3f2a1b",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:51.520Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "5e3f2d1a9b8c7e6d",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:30:54.234Z",
        "name": "stt_node",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 2.714,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{\"attributes\":{\"lk.stt.streaming\":\"true\",\"lk.stt.label\":\"sipeech.agents.inference.tts.TTS\",\"lk.stt.model\":\"\"}}"
      },
      {
        "id": "8c7d6e5f4a3b2c1d",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:51.520Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "9a7b6c5d4e3f2a1b",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:30:54.234Z",
        "name": "stt_request",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 2.714,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "7d6e5f4a3b2c1d0e",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:51.520Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "8c7d6e5f4a3b2c1d",
        "type": "GENERATION",
        "environment": "default",
        "endTime": "2026-02-03T13:30:54.234Z",
        "name": "open.chat",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": "gpt-4",
        "internalModelId": null,
        "modelParameters": "{\"temperature\":0.7,\"max_tokens\":2048}",
        "completionStartTime": "2026-02-03T13:30:52.000Z",
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 2.234,
        "timeToFirstToken": 0.48,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": 0.0015,
        "outputCost": 0.002,
        "totalCost": 0.0035,
        "inputUsage": 50,
        "outputUsage": 100,
        "totalUsage": 150,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "fe6c035598f57a0b",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:57.251Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "eccf2a7ed58c3ec1",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:31:01.642Z",
        "name": "agent_turn",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 4.391,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "6e5f4a3b2c1d0e9f",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:57.251Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "fe6c035598f57a0b",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:30:58.513Z",
        "name": "llm_node",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 1.262,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{\"attributes\":{\"telemetry.sdk.language\":\"python\",\"telemetry.sdk.name\":\"opentelemetry\",\"telemetry.sdk.version\":\"1.39.1\",\"service.name\":\"webcam_service\",\"voiceeval.tenant.email\":\"admin@voiceeval.com\",\"tenant.id\":\"admin@voiceeval.com\"}}"
      },
      {
        "id": "5f4a3b2c1d0e9f8a",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:57.251Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "6e5f4a3b2c1d0e9f",
        "type": "GENERATION",
        "environment": "default",
        "endTime": "2026-02-03T13:30:58.513Z",
        "name": "llm_request",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": "gpt-4o",
        "internalModelId": null,
        "modelParameters": "{\"temperature\":0.8,\"max_tokens\":1024}",
        "completionStartTime": "2026-02-03T13:30:57.400Z",
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 1.262,
        "timeToFirstToken": 0.149,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": 0.003,
        "outputCost": 0.006,
        "totalCost": 0.009,
        "inputUsage": 120,
        "outputUsage": 200,
        "totalUsage": 320,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "b48c49b0a578620d",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:57.255Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "fe6c035598f57a0b",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:30:59.280Z",
        "name": "tts_node",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 2.025,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "83a777d3ecb478da",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:57.255Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "b48c49b0a578620d",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:30:59.280Z",
        "name": "tts_request",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 2.025,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{\"attributes\":{\"lk.tts.streaming\":\"true\",\"lk.tts.label\":\"\",\"lk.tts.model\":\"\",\"lk.tts.metrics\":{}}}"
      },
      {
        "id": "f80e5e8c2881ce80",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:58.514Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "fe6c035598f57a0b",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:31:01.642Z",
        "name": "agent_speaking",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 3.128,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "42aaa76eb1379b61",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:31:02.446Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "eccf2a7ed58c3ec1",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:31:02.447Z",
        "name": "drain_agent_activity",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 0.001,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "4a3b2c1d0e9f8a7b",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:54.500Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "eccf2a7ed58c3ec1",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:30:56.800Z",
        "name": "function_call",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 2.300,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": {},
        "toolCalls": [],
        "toolCallNames": [],
        "metadata": "{}"
      },
      {
        "id": "3b2c1d0e9f8a7b6c",
        "traceId": "675a4453e2713dec0017418edf2d9787",
        "startTime": "2026-02-03T13:30:54.520Z",
        "projectId": "cmkme4iwh00qnad079j0kakep",
        "parentObservationId": "4a3b2c1d0e9f8a7b",
        "type": "SPAN",
        "environment": "default",
        "endTime": "2026-02-03T13:30:56.780Z",
        "name": "tool_call",
        "level": "DEFAULT",
        "statusMessage": null,
        "version": null,
        "createdAt": "2026-02-03T13:31:05.706Z",
        "updatedAt": "2026-02-03T13:31:05.706Z",
        "model": null,
        "internalModelId": null,
        "modelParameters": null,
        "completionStartTime": null,
        "promptId": null,
        "promptName": null,
        "promptVersion": null,
        "latency": 2.260,
        "timeToFirstToken": null,
        "usageDetails": {},
        "costDetails": {},
        "providedCostDetails": {},
        "inputCost": null,
        "outputCost": null,
        "totalCost": 0,
        "inputUsage": 0,
        "outputUsage": 0,
        "totalUsage": 0,
        "usagePricingTierId": null,
        "usagePricingTierName": null,
        "toolDefinitions": "{\"get_weather\":{\"description\":\"Get weather information\",\"parameters\":{}}}",
        "toolCalls": ["get_weather"],
        "toolCallNames": ["get_weather"],
        "metadata": "{}"
      }
    ]
  }
};

/**
 * TraceViewer Component
 * Displays trace data in an expandable hierarchical tree structure with side panel
 * Similar to Langfuse's trace viewer but with consistent dark theme
 */
const TraceViewer = ({ traceData, onBack }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  
  // Use mock data if no trace data is provided
  const displayData = traceData || MOCK_TRACE_DATA;

  // Build tree structure from flat observations array
  const traceTree = useMemo(() => {
    if (!displayData?.trace?.observations || displayData.trace.observations.length === 0) {
      return null;
    }

    const observations = displayData.trace.observations;
    const observationMap = new Map();
    const rootNodes = [];

    // Create a map of all observations by ID
    observations.forEach(obs => {
      observationMap.set(obs.id, { ...obs, children: [] });
    });

    // Build parent-child relationships
    observations.forEach(obs => {
      const node = observationMap.get(obs.id);
      if (obs.parentObservationId) {
        const parent = observationMap.get(obs.parentObservationId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }, [displayData]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (!displayData?.trace?.observations) return;
    const allIds = new Set(displayData.trace.observations.map(obs => obs.id));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const formatLatency = (latency) => {
    if (latency === null || latency === undefined) return 'N/A';
    if (latency < 1) return `${(latency * 1000).toFixed(2)}ms`;
    return `${latency.toFixed(3)}s`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getStatusColor = (statusMessage, level) => {
    if (statusMessage) return 'text-red-400';
    if (level === 'ERROR') return 'text-red-400';
    if (level === 'WARNING') return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusIcon = (statusMessage, level) => {
    if (statusMessage || level === 'ERROR') return AlertCircle;
    if (level === 'WARNING') return AlertCircle;
    return CheckCircle;
  };

  const getObservationIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('llm') || lowerName.includes('agent')) return Activity;
    if (lowerName.includes('tts') || lowerName.includes('stt')) return Zap;
    if (lowerName.includes('tool')) return Database;
    return Box;
  };

  // Recursive component to render observation nodes
  const ObservationNode = ({ node, depth = 0 }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const StatusIcon = getStatusIcon(node.statusMessage, node.level);
    const ObsIcon = getObservationIcon(node.name);
    const isSelected = selectedNode?.id === node.id;

    const handleNodeClick = () => {
      setSelectedNode(node);
      setSidePanelOpen(true);
    };

    return (
      <div className="w-full">
        {/* Node Row */}
        <div
          onClick={handleNodeClick}
          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-l-2 transition-all ${
            isSelected
              ? 'bg-teal-500/10 border-l-teal-500'
              : node.statusMessage 
                ? 'border-l-red-500/50 hover:bg-gray-800/50' 
                : 'border-l-gray-700/50 hover:bg-gray-800/50 hover:border-l-teal-500/30'
          }`}
          style={{ paddingLeft: `${depth * 20 + 16}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              hasChildren && toggleNode(node.id);
            }}
            className={`flex-shrink-0 ${hasChildren ? 'text-gray-400 hover:text-teal-400' : 'text-transparent'}`}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )
            ) : (
              <div className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Observation Icon */}
          <ObsIcon className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />

          {/* Name and Type */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{node.name}</p>
            <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-800/50 rounded">
              {node.type}
            </span>
          </div>

          {/* Latency */}
          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span className="font-mono">{formatLatency(node.latency)}</span>
          </div>

          {/* Status */}
          <StatusIcon 
            className={`w-3.5 h-3.5 flex-shrink-0 ${getStatusColor(node.statusMessage, node.level)}`} 
          />
        </div>

        {/* Render Children */}
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => (
              <ObservationNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Side Panel Component
  const SidePanel = () => {
    if (!selectedNode) return null;

    return (
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-[#030712] border-l border-gray-800/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-gray-200">Observation Details</h3>
          </div>
          <button
            onClick={() => setSidePanelOpen(false)}
            className="p-1 hover:bg-gray-800/50 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-4">
          {/* Basic Info */}
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="text-sm text-gray-200 font-medium">{selectedNode.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="text-sm text-gray-200">{selectedNode.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Level</p>
                <p className="text-sm text-gray-200">{selectedNode.level}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">ID</p>
              <p className="text-xs text-gray-400 font-mono break-all">{selectedNode.id}</p>
            </div>
          </div>

          {/* Timing */}
          <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase">Timing</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Latency</span>
                <span className="text-sm text-teal-400 font-mono">{formatLatency(selectedNode.latency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Start Time</span>
                <span className="text-xs text-gray-300 font-mono">{formatTimestamp(selectedNode.startTime)}</span>
              </div>
              {selectedNode.endTime && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">End Time</span>
                  <span className="text-xs text-gray-300 font-mono">{formatTimestamp(selectedNode.endTime)}</span>
                </div>
              )}
              {selectedNode.timeToFirstToken && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Time to First Token</span>
                  <span className="text-sm text-teal-400 font-mono">{formatLatency(selectedNode.timeToFirstToken)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Model Details */}
          {selectedNode.model && (
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase">Model</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Model</span>
                  <span className="text-sm text-gray-200">{selectedNode.model}</span>
                </div>
                {selectedNode.modelParameters && selectedNode.modelParameters !== '{}' && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Parameters</p>
                    <pre className="text-xs text-gray-300 bg-gray-950/50 p-2 rounded overflow-x-auto">
                      {typeof selectedNode.modelParameters === 'string'
                        ? JSON.stringify(JSON.parse(selectedNode.modelParameters), null, 2)
                        : JSON.stringify(selectedNode.modelParameters, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Usage & Cost */}
          {(selectedNode.totalUsage > 0 || selectedNode.totalCost > 0) && (
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase">Usage & Cost</h4>
              <div className="space-y-2">
                {selectedNode.inputUsage > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Input Tokens</span>
                    <span className="text-sm text-gray-200">{selectedNode.inputUsage.toLocaleString()}</span>
                  </div>
                )}
                {selectedNode.outputUsage > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Output Tokens</span>
                    <span className="text-sm text-gray-200">{selectedNode.outputUsage.toLocaleString()}</span>
                  </div>
                )}
                {selectedNode.totalUsage > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Tokens</span>
                    <span className="text-sm text-teal-400 font-semibold">{selectedNode.totalUsage.toLocaleString()}</span>
                  </div>
                )}
                {selectedNode.inputCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Input Cost</span>
                    <span className="text-sm text-gray-200">${selectedNode.inputCost.toFixed(6)}</span>
                  </div>
                )}
                {selectedNode.outputCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Output Cost</span>
                    <span className="text-sm text-gray-200">${selectedNode.outputCost.toFixed(6)}</span>
                  </div>
                )}
                {selectedNode.totalCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Cost</span>
                    <span className="text-sm text-teal-400 font-semibold">${selectedNode.totalCost.toFixed(6)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tool Calls */}
          {selectedNode.toolCalls && selectedNode.toolCalls.length > 0 && (
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase">Tool Calls</h4>
              <div className="space-y-2">
                {selectedNode.toolCalls.map((tool, idx) => (
                  <div key={idx} className="bg-gray-950/50 rounded p-2">
                    <p className="text-xs text-gray-300 font-mono">
                      {typeof tool === 'string' ? tool : JSON.stringify(tool)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Definitions */}
          {selectedNode.toolDefinitions && selectedNode.toolDefinitions !== '{}' && selectedNode.toolDefinitions !== '' && (
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase">Tool Definitions</h4>
              <pre className="text-xs text-gray-300 bg-gray-950/50 p-3 rounded overflow-x-auto">
                {typeof selectedNode.toolDefinitions === 'string'
                  ? JSON.stringify(JSON.parse(selectedNode.toolDefinitions), null, 2)
                  : JSON.stringify(selectedNode.toolDefinitions, null, 2)}
              </pre>
            </div>
          )}

          {/* Metadata */}
          {selectedNode.metadata && selectedNode.metadata !== '{}' && (
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase">Metadata</h4>
              <pre className="text-xs text-gray-300 bg-gray-950/50 p-3 rounded overflow-x-auto max-h-60 overflow-y-auto">
                {JSON.stringify(JSON.parse(selectedNode.metadata), null, 2)}
              </pre>
            </div>
          )}

          {/* Status Message */}
          {selectedNode.statusMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-red-400 uppercase mb-2">Error Message</h4>
              <p className="text-sm text-red-300">{selectedNode.statusMessage}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!displayData?.trace) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] p-6">
        <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-12 text-center">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No trace data available</p>
        </div>
      </div>
    );
  }

  const trace = displayData.trace;

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Full Page Layout with Side Panel */}
      <div className={`transition-all duration-300 ${sidePanelOpen ? 'mr-[500px]' : 'mr-0'}`}>
        <div className="p-6 space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{trace.name}</h2>
              <p className="text-sm text-gray-400 mt-1">Trace ID: {trace.id}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-2 text-xs bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 text-xs bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Trace Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Total Latency</p>
              <p className="text-2xl text-teal-400 font-bold">{formatLatency(trace.latency)}</p>
            </div>
            <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Observations</p>
              <p className="text-2xl text-teal-400 font-bold">{trace.observations?.length || 0}</p>
            </div>
            <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Environment</p>
              <p className="text-sm text-gray-300">{trace.environment || 'default'}</p>
            </div>
            <div className="bg-[#030712] border border-teal-500/20 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Timestamp</p>
              <p className="text-xs text-gray-300">{new Date(trace.timestamp).toLocaleString()}</p>
            </div>
          </div>

          {/* Observation Tree */}
          <div className="bg-[#030712] border border-teal-500/20 rounded-xl overflow-hidden">
            <div className="border-b border-gray-800/50 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-200">Execution Timeline</h3>
              <p className="text-xs text-gray-500 mt-1">Click on any observation to view detailed information</p>
            </div>
            <div className="divide-y divide-gray-800/30">
              {traceTree && traceTree.length > 0 ? (
                traceTree.map(node => (
                  <ObservationNode key={node.id} node={node} depth={0} />
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No observations found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <SidePanel />
    </div>
  );
};

export default TraceViewer;