import originalTheme from "tm-themes/themes/ayu-light.json";

export const BACKGROUND_PROPERTIES = [
	"activityBar.background",
	"activityBar.border",
	"activityBarBadge.foreground",
	"button.foreground",
	"editor.background",
	"editorGroupHeader.noTabsBackground",
	"editorGroupHeader.tabsBackground",
	"editorGroupHeader.tabsBorder",
	"inputValidation.infoBackground",
	"inputValidation.warningBackground",
	"minimap.background",
	"panel.background",
	"sideBar.background",
	"sideBar.border",
	"sideBarSectionHeader.background",
	"sideBarSectionHeader.border",
	"statusBar.background",
	"statusBar.border",
	"tab.activeBackground",
	"tab.border",
	"tab.inactiveBackground",
	"terminal.background",
	"titleBar.activeBackground",
	"titleBar.border",
	"titleBar.inactiveBackground",
	"welcomePage.tileBackground",
] as const;

const theme = structuredClone(originalTheme) as any;

const replaceColor = "#fcfcfc";
const newColor = "#ffffff";

for (const key in theme.colors) {
	if (theme.colors[key] === replaceColor) {
		theme.colors[key] = newColor;
	}
}

for (const tokenColor of theme.tokenColors) {
	for (const key in tokenColor.settings) {
		if (tokenColor.settings[key] === replaceColor) {
			tokenColor.settings[key] = newColor;
		}
	}
}

export default theme;
