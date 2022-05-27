import React, { useState } from 'react'

import Editor from "@monaco-editor/react";


const CodeEditorWindow = ({ onChange, language, code, theme, isFullScreen, Fontoptions }) => {
    const [value, setValue] = useState(code || "")

    React.useEffect(() => {
        setValue(code)
    }, [code])
    const handleEditorChange = (value) => {
        setValue(value);
        onChange("code", value);
    };
    return (
        <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl"


        >
            <Editor
                options={Fontoptions}
                height={isFullScreen ? "96.5vh" : "86vh"}
                width={`100%`}
                language={language || "javascript"}
                value={value}
                theme={theme}
                autoIndent={true}
                fontSize={30}

                defaultValue="// some comment"
                onChange={handleEditorChange}
            />
        </div>
    )
}

export default CodeEditorWindow