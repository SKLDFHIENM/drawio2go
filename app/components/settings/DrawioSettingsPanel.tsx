"use client";

import { useCallback, useState } from "react";
import {
  Button,
  Description,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
import { RotateCcw } from "lucide-react";
import type { Key } from "react";

import ConfirmDialog from "../common/ConfirmDialog";
import { useAppTranslation } from "@/app/i18n/hooks";
import type { DrawioTheme } from "@/app/lib/config-utils";
import { extractSingleKey, normalizeSelection } from "@/app/lib/select-utils";

export interface DrawioSettingsPanelProps {
  drawioBaseUrl: string;
  drawioIdentifier: string;
  drawioTheme: DrawioTheme;
  drawioUrlParams: string;
  drawioBaseUrlError?: string;
  drawioIdentifierError?: string;
  onDrawioBaseUrlChange: (value: string) => void;
  onDrawioIdentifierChange: (value: string) => void;
  onDrawioThemeChange: (value: DrawioTheme) => void;
  onDrawioUrlParamsChange: (value: string) => void;
  onResetDrawioBaseUrl: () => void | Promise<void>;
  onResetDrawioIdentifier: () => void | Promise<void>;
  onResetDrawioUrlParams: () => void | Promise<void>;
}

const THEME_OPTIONS: Array<{ key: DrawioTheme; labelKey: string }> = [
  { key: "kennedy", labelKey: "drawio.theme.options.kennedy" },
  { key: "min", labelKey: "drawio.theme.options.min" },
  { key: "atlas", labelKey: "drawio.theme.options.atlas" },
  { key: "sketch", labelKey: "drawio.theme.options.sketch" },
  { key: "simple", labelKey: "drawio.theme.options.simple" },
];

export default function DrawioSettingsPanel({
  drawioBaseUrl,
  drawioIdentifier,
  drawioTheme,
  drawioUrlParams,
  drawioBaseUrlError,
  drawioIdentifierError,
  onDrawioBaseUrlChange,
  onDrawioIdentifierChange,
  onDrawioThemeChange,
  onDrawioUrlParamsChange,
  onResetDrawioBaseUrl,
  onResetDrawioIdentifier,
  onResetDrawioUrlParams,
}: DrawioSettingsPanelProps) {
  const { t } = useAppTranslation("settings");
  const [isResetBaseUrlOpen, setIsResetBaseUrlOpen] = useState(false);
  const [isResetIdentifierOpen, setIsResetIdentifierOpen] = useState(false);
  const [isResetUrlParamsOpen, setIsResetUrlParamsOpen] = useState(false);

  const handleThemeChange = useCallback(
    (nextKey: Key | null) => {
      const selection = normalizeSelection(nextKey);
      if (!selection) return;
      const selectedKey = extractSingleKey(selection);
      if (typeof selectedKey !== "string") return;
      onDrawioThemeChange(selectedKey as DrawioTheme);
    },
    [onDrawioThemeChange],
  );

  return (
    <div className="settings-panel flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="section-title">{t("drawio.title")}</h3>
        <p className="section-description">{t("drawio.description")}</p>
      </div>

      <TextField className="w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-foreground">
              {t("drawio.baseUrl.label")}
            </Label>
            <Description className="text-sm text-default-500">
              {t("drawio.baseUrl.description")}
            </Description>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onPress={() => setIsResetBaseUrlOpen(true)}
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t("drawio.baseUrl.reset")}
          </Button>
        </div>

        <Input
          value={drawioBaseUrl}
          onChange={(event) => onDrawioBaseUrlChange(event.target.value)}
          placeholder={t("drawio.baseUrl.placeholder")}
          aria-label={t("drawio.baseUrl.label")}
          className="mt-4 w-full"
        />

        <Description className="mt-2 text-sm text-danger">
          {t("drawio.baseUrl.warning")}
        </Description>

        {drawioBaseUrlError ? (
          <Description className="mt-2 text-sm text-danger">
            {drawioBaseUrlError}
          </Description>
        ) : null}
      </TextField>

      <TextField className="w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-foreground">
              {t("drawio.identifier.label")}
            </Label>
            <Description className="text-sm text-default-500">
              {t("drawio.identifier.description")}
            </Description>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onPress={() => setIsResetIdentifierOpen(true)}
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t("drawio.identifier.reset")}
          </Button>
        </div>

        <Input
          value={drawioIdentifier}
          onChange={(event) => onDrawioIdentifierChange(event.target.value)}
          placeholder={t("drawio.identifier.placeholder")}
          aria-label={t("drawio.identifier.label")}
          className="mt-4 w-full"
        />

        <Description className="mt-2 text-sm text-danger">
          {t("drawio.identifier.warning")}
        </Description>

        {drawioIdentifierError ? (
          <Description className="mt-2 text-sm text-danger">
            {drawioIdentifierError}
          </Description>
        ) : null}
      </TextField>

      <Select
        className="w-full"
        selectedKey={drawioTheme}
        onSelectionChange={handleThemeChange}
        aria-label={t("drawio.theme.label")}
      >
        <Label className="text-sm text-foreground">
          {t("drawio.theme.label")}
        </Label>

        <Select.Trigger className="mt-3 flex w-full items-center justify-between rounded-md border border-default-200 bg-content1 px-3 py-2 text-left text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 hover:border-primary">
          <Select.Value className="text-sm leading-6 text-foreground" />
          <Select.Indicator className="text-default-500" />
        </Select.Trigger>

        <Select.Popover className="rounded-2xl border border-default-200 bg-content1 p-2 shadow-2xl">
          <ListBox className="flex flex-col gap-1">
            {THEME_OPTIONS.map((theme) => (
              <ListBox.Item
                key={theme.key}
                id={theme.key}
                textValue={t(theme.labelKey)}
                className="select-item flex items-center justify-between rounded-xl text-sm text-foreground hover:bg-primary-50"
              >
                {t(theme.labelKey)}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>

        <Description className="mt-3">{t("drawio.theme.description")}</Description>
      </Select>

      <TextField className="w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-foreground">
              {t("drawio.urlParams.label")}
            </Label>
            <Description className="text-sm text-default-500">
              {t("drawio.urlParams.description")}
            </Description>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onPress={() => setIsResetUrlParamsOpen(true)}
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t("drawio.urlParams.reset")}
          </Button>
        </div>

        <Input
          value={drawioUrlParams}
          onChange={(event) => onDrawioUrlParamsChange(event.target.value)}
          placeholder={t("drawio.urlParams.placeholder")}
          aria-label={t("drawio.urlParams.label")}
          className="mt-4 w-full"
        />

        <Description className="mt-2 text-sm text-danger">
          {t("drawio.urlParams.warning")}
        </Description>
      </TextField>

      <ConfirmDialog
        isOpen={isResetBaseUrlOpen}
        onOpenChange={setIsResetBaseUrlOpen}
        title={t("drawio.baseUrl.resetTitle")}
        description={t("drawio.baseUrl.resetConfirm")}
        confirmText={t("common.confirm", { defaultValue: "Confirm" })}
        cancelText={t("common.cancel", { defaultValue: "Cancel" })}
        variant="danger"
        onConfirm={onResetDrawioBaseUrl}
      />

      <ConfirmDialog
        isOpen={isResetIdentifierOpen}
        onOpenChange={setIsResetIdentifierOpen}
        title={t("drawio.identifier.resetTitle")}
        description={t("drawio.identifier.resetConfirm")}
        confirmText={t("common.confirm", { defaultValue: "Confirm" })}
        cancelText={t("common.cancel", { defaultValue: "Cancel" })}
        variant="danger"
        onConfirm={onResetDrawioIdentifier}
      />

      <ConfirmDialog
        isOpen={isResetUrlParamsOpen}
        onOpenChange={setIsResetUrlParamsOpen}
        title={t("drawio.urlParams.label")}
        description={t("drawio.urlParams.resetConfirm")}
        confirmText={t("common.confirm", { defaultValue: "Confirm" })}
        cancelText={t("common.cancel", { defaultValue: "Cancel" })}
        variant="danger"
        onConfirm={onResetDrawioUrlParams}
      />
    </div>
  );
}
