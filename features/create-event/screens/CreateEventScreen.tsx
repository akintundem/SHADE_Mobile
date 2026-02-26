import React, { useCallback } from 'react';
import { View, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingOverlay } from '../../../common/components/LoadingStates';
import {
  EventBasicsStep,
  CategorizeStep,
  WhenStep,
  LocationStep,
  AccessStep,
  TeamContributionsStep,
  ReviewStep,
} from '../components/steps';
import { StepHeader } from '../components/StepHeader';
import { StepFooter } from '../components/StepFooter';
import { STEPS } from '../../../core/events/constants';
import { CreateEventProvider, useCreateEvent } from '../context';

type Props = { onClose: () => void; onCreate?: () => void };

function CreateEventContent() {
  const { flow, status, actions } = useCreateEvent();
  const currentStep = flow.currentStep;

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 0:
        return <EventBasicsStep />;
      case 1:
        return <CategorizeStep />;
      case 2:
        return <WhenStep />;
      case 3:
        return <LocationStep />;
      case 4:
        return <AccessStep />;
      case 5:
        return <TeamContributionsStep />;
      case 6:
        return <ReviewStep />;
      default:
        return null;
    }
  }, [currentStep]);

  const bannerClassName = status.banner?.type === 'warning'
    ? 'bg-semantic-warning-light border-semantic-warning'
    : 'bg-semantic-error-light border-semantic-error';

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <StepHeader
          currentStep={currentStep}
          steps={STEPS}
          onBack={actions.goBack}
          onClose={actions.close}
        />

        {status.banner ? (
          <View className={`mx-lg mt-sm p-md rounded-xl border ${bannerClassName}`}>
            <Text className="text-txt-primary dark:text-txt-dark-primary">
              {status.banner.message}
            </Text>
          </View>
        ) : null}

        <View className="flex-1">
          {renderStepContent()}
        </View>

        <View className="p-lg">
          <StepFooter
            isLastStep={currentStep === STEPS.length - 1}
            canProceed={flow.canProceed}
            isLoading={status.isSubmitting}
            onNext={actions.goNext}
            onClose={actions.close}
            onCreate={actions.submit}
          />
        </View>

        <LoadingOverlay visible={status.isSubmitting} message="Creating Event..." />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function CreateEventScreen({ onClose, onCreate }: Props) {
  return (
    <CreateEventProvider onClose={onClose} onCreate={onCreate}>
      <CreateEventContent />
    </CreateEventProvider>
  );
}
