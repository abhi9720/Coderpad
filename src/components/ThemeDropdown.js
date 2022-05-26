import React from 'react'
import Select from "react-select";
import monacoThemes from "monaco-themes/themes/themelist";
import { customStyles } from "../constants/customStyles";

const ThemeDropdown = ({ handleThemeChange, Usertheme }) => {
    console.log(Usertheme);
    return (
        <Select
            placeholder={`Select Theme`}
            // options={languageOptions}
            options={Object.entries(monacoThemes).map(([themeId, themeName]) => ({
                label: themeName,
                value: themeId,
                key: themeId,
            }))}
            defaultValue={Usertheme}

            styles={customStyles}
            onChange={(th) => handleThemeChange(th)}
        />
    )
}

export default ThemeDropdown


