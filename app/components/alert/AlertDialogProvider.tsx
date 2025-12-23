"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import GlobalAlertDialog from "./GlobalAlertDialog";
import type {
  AlertDialogContextValue,
  AlertDialogPayload,
  AlertDialogState,
} from "@/app/types/alert-dialog";
import { useAppTranslation } from "@/app/i18n/hooks";

type AlertDialogInternalState = AlertDialogState & { isProcessing: boolean };

type AlertDialogAction =
  | { type: "OPEN"; payload: AlertDialogPayload }
  | { type: "CLOSE" }
  | { type: "START_PROCESSING" }
  | { type: "STOP_PROCESSING" };

const initialState: AlertDialogInternalState = {
  isOpen: false,
  status: "warning",
  title: "",
  description: "",
  actionLabel: undefined,
  cancelLabel: undefined,
  onAction: undefined,
  onCancel: undefined,
  isDismissable: false,
  isProcessing: false,
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);
const AlertDialogInternalContext = createContext<{
  state: AlertDialogInternalState;
  dispatch: Dispatch<AlertDialogAction>;
} | null>(null);

const alertDialogReducer = (
  state: AlertDialogInternalState,
  action: AlertDialogAction,
): AlertDialogInternalState => {
  switch (action.type) {
    case "OPEN":
      return {
        ...initialState,
        ...action.payload,
        isOpen: true,
        isProcessing: false,
      };
    case "CLOSE":
      return { ...initialState };
    case "START_PROCESSING":
      return { ...state, isProcessing: true };
    case "STOP_PROCESSING":
      return { ...state, isProcessing: false };
    default:
      return state;
  }
};

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(alertDialogReducer, initialState);
  const { t } = useAppTranslation(["common", "errors"]);

  const open = useCallback(
    (payload: AlertDialogPayload) => {
      const normalize = (value?: string) => value?.trim() ?? "";
      const normalizedTitle = normalize(payload.title);
      const normalizedDescription = normalize(payload.description);
      const isContentMissing =
        normalizedTitle.length === 0 && normalizedDescription.length === 0;

      if (isContentMissing) {
        // 避免出现空白弹窗，输出调试信息并使用兜底文案
        console.error(
          "[AlertDialogProvider] open() fallback applied for empty content",
          payload,
        );
      }

      const fallbackTitle = t("common:errorBoundary.title", "应用发生错误");
      const fallbackDescription = t(
        "errors:common.unknownError",
        "发生未知错误",
      );

      dispatch({
        type: "OPEN",
        payload: {
          ...payload,
          title: isContentMissing ? fallbackTitle : normalizedTitle,
          description: isContentMissing
            ? fallbackDescription
            : normalizedDescription,
          isDismissable:
            payload.isDismissable ??
            (isContentMissing ? true : initialState.isDismissable),
        },
      });
    },
    [t],
  );

  const close = useCallback(() => {
    dispatch({ type: "CLOSE" });
  }, []);

  const contextValue = useMemo<AlertDialogContextValue>(
    () => ({ open, close }),
    [open, close],
  );

  const internalValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AlertDialogContext.Provider value={contextValue}>
      <AlertDialogInternalContext.Provider value={internalValue}>
        {children}
        <GlobalAlertDialog />
      </AlertDialogInternalContext.Provider>
    </AlertDialogContext.Provider>
  );
}

export const useAlertDialog = (): AlertDialogContextValue => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error("useAlertDialog must be used within AlertDialogProvider");
  }
  return context;
};

export const useAlertDialogInternal = () => {
  const context = useContext(AlertDialogInternalContext);
  if (!context) {
    throw new Error(
      "useAlertDialogInternal must be used within AlertDialogProvider",
    );
  }
  return context;
};
