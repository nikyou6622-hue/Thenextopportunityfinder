import React from 'react';
import ProcessingState from '../ProcessingState';

/**
 * BrandedLoadingState Wrapper Component
 * Delegates to the unified ProcessingState component for 100% copy and telemetry compliance.
 */
export default function BrandedLoadingState({
  character = 'nova',
  title = 'Processing request',
  fullScreen = false,
  timeoutMs = 30000,
  actionType = 'branded_loading',
  onRetry = null
}) {
  return (
    <ProcessingState
      label={title}
      scope={fullScreen ? 'fullpage' : 'inline'}
      character={character}
      timeoutMs={timeoutMs}
      actionType={actionType}
      isProcessing={true}
      onRetry={onRetry}
    />
  );
}
