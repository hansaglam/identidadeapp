import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "./ConfirmDialog";
import {
  completeNotificationPermissionRationale,
  subscribeNotificationPermissionRationale,
} from "../utils/notificationPermissionPrompt";

export default function NotificationPermissionRationaleModal() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeNotificationPermissionRationale(setVisible), []);

  return (
    <ConfirmDialog
      visible={visible}
      title={t("notifications.permissionRationale.title")}
      message={t("notifications.permissionRationale.message")}
      tone="default"
      closeOnBackdropPress={false}
      onRequestClose={() => completeNotificationPermissionRationale("deny")}
      actions={[
        {
          label: t("notifications.permissionRationale.deny"),
          variant: "secondary",
          onPress: () => completeNotificationPermissionRationale("deny"),
        },
        {
          label: t("notifications.permissionRationale.allow"),
          variant: "primary",
          onPress: () => completeNotificationPermissionRationale("allow"),
        },
      ]}
    />
  );
}
