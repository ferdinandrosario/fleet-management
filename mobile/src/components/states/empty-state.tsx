import { useTranslation } from "react-i18next";

import { StateMessage } from "./state-message";

export function EmptyState({ body }: { body?: string }) {
  const { t } = useTranslation();
  return <StateMessage title={t("states.emptyTitle")} body={body} />;
}
