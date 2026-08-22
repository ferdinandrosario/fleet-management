import { useTranslation } from "react-i18next";

import { StateMessage } from "./state-message";

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <StateMessage
      title={t("states.errorTitle")}
      actionLabel={onRetry ? t("common.retry") : undefined}
      onAction={onRetry}
      liveRegion="assertive"
    />
  );
}
