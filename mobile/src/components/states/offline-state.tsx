import { useTranslation } from "react-i18next";

import { StateMessage } from "./state-message";

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <StateMessage
      title={t("states.offlineTitle")}
      body={t("states.offlineBody")}
      actionLabel={onRetry ? t("common.retry") : undefined}
      onAction={onRetry}
    />
  );
}
