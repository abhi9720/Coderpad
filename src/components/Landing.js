import React, { useEffect, useState } from 'react'
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { languageOptions } from "../constants/languageOptions";
import { snippet } from "../constants/snippet";
import { classnames } from "../utils/general";

import { FaExpand, FaCompress } from 'react-icons/fa';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { defineTheme } from "../lib/defineTheme"

import LanguagesDropdown from './LanguageDropdown';
import ThemeDropdown from './ThemeDropdown';

import CustomInput from './CustomInput';
import OutputWindow from './OutputWindow';
import OutputDetails from './OutputDetails';
import useKeyPress from '../hooks/useKeyPress';

const defaultCode = `// Type Your code here 1`;
const Landing = () => {


    const [code, setCode] = useState(defaultCode);
    const [theme, setTheme] = useState("cobalt");
    const [customInput, setCustomInput] = useState("");
    const [outputDetails, setOutputDetails] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [fullScreen, setFullScreen] = useState(false);

    const [language, setLanguage] = useState(JSON.parse(localStorage.getItem("language")) || languageOptions[0]);



    const onChange = (action, data) => {
        switch (action) {
            case "code": {
                setCode(data);
                window.localStorage.setItem(language.value, JSON.stringify(data))
                break;
            }

            default: {
                console.warn("case not handled!", action, data);
            }
        }
    };



    useEffect(() => {
        const prevCode = JSON.parse(localStorage.getItem(language.value));
        setCode(prevCode || snippet(language.value));

    }, [language.value]);





    const ctrlPress = useKeyPress("Control");
    const key_run = useKeyPress("F9");
    const key_save = useKeyPress("q")




    const onSelectChange = (sl) => {
        console.log("selected Option...", sl);
        setLanguage(sl);
        localStorage.setItem("language", JSON.stringify(sl));
    };

    const downloadTxtFile = (data) => {
        const element = document.createElement("a");
        const file = new Blob([data], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);

        element.download = `${language.value}-code.txt`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    useEffect(() => {
        if (key_run) {
            handleCompile();
        }
        // eslint-disable-next-line
    }, [ctrlPress, key_run]);

    useEffect(() => {
        if (ctrlPress && key_save) {

            downloadTxtFile(code)
        }
        // eslint-disable-next-line
    }, [ctrlPress, key_save, code]);



    async function handleThemeChange(th) {
        const theme = th;
        console.log("theme...", theme);

        if (["light", "vs-dark"].includes(theme.value)) {
            setTheme(theme);
        } else {
            defineTheme(theme.value)
                .then((_) => {
                    setTheme(theme);
                })
        }

    }

    const handleCompile = () => {

        setProcessing(true);
        const formData = {
            language_id: language.id,
            source_code: btoa(code),
            stdin: btoa(customInput),
        };


        const options = {
            method: "POST",
            url: process.env.REACT_APP_RAPID_API_URL,
            params: { base64_encoded: "true", fields: "*" },
            headers: {
                "content-type": "application/json",
                "Content-Type": "application/json",
                "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
                "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
            },
            data: formData,
        };

        axios
            .request(options)
            .then(function (response) {
                console.log("res.data", response.data);
                const token = response.data.token;
                checkStatus(token);
            })
            .catch((err) => {
                let error = err.response ? err.response.data : err;
                setProcessing(false);
                console.log(error);
            });
    };

    const checkStatus = async (token) => {
        const options = {
            method: "GET",
            url: process.env.REACT_APP_RAPID_API_URL + "/" + token,
            params: { base64_encoded: "true", fields: "*" },
            headers: {
                "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
                "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
            },
        };


        try {
            let response = await axios.request(options);
            let statusId = response.data.status?.id;

            // Processed - we have a result
            if (statusId === 1 || statusId === 2) {
                /* So, if statusId ===1 OR statusId ===2 
                that means our code is still processing and 
                we need to call the API again to check 
                if we get any results or not.*/
                setTimeout(() => {
                    checkStatus(token)
                }, 2000)
                return
            } else {
                setProcessing(false)
                setOutputDetails(response.data)
                showSuccessToast(`Compiled Successfully!`)
                console.log('response.data', response.data)
                return
            }
        } catch (err) {
            console.log("err", err);
            setProcessing(false);
            showErrorToast();
        }
    };


    const resetCode = () => {

        let text = "Your code will be discarded and reset to the default code!";
        if (window.confirm(text)) {
            setCode(snippet(language.value))
        }

    }

    function go_full_screen() {

        if (document.fullscreenElement) {
            document.exitFullscreen()
                .then(() => console.log("Document Exited from Full screen mode"))
                .catch((err) => console.error(err))
        } else {
            document.documentElement.requestFullscreen();
        }
    }
    const makeFullScreen = () => {

        go_full_screen()

        setFullScreen(!fullScreen)

    }

    useEffect(() => {
        defineTheme("oceanic-next").then((_) =>
            setTheme({ value: "oceanic-next", label: "Oceanic Next" })
        );
    }, []);

    const showSuccessToast = (msg) => {
        toast.success(msg || `Compiled Successfully!`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };
    const showErrorToast = (msg) => {
        toast.error(msg || `Something went wrong! Please try again.`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };


    const handleShare = async () => {



        try {
            await navigator.share({
                files: [
                    new File([code], 'codetext.txt', { type: "text/plain", }),
                ],
                title: 'code',
                text: 'code',
            },
                {

                    copy: true,
                    email: true,
                    print: true,
                    sms: true,
                    messenger: true,
                    facebook: true,
                    whatsapp: true,
                    twitter: true,
                    linkedin: true,
                    telegram: true,
                    skype: true,
                    pinterest: true,
                    language: 'pt'
                }
            );

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            {
                !fullScreen &&
                <>
                    <div className="h-4 w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 transition duration-200">
                    </div>

                    <div className="flex flex-row transition duration-200" >
                        <div className="px-4 py-1">
                            <LanguagesDropdown onSelectChange={onSelectChange} Userlanguage={language} />
                        </div>
                        <div className="px-4 py-1">
                            <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
                        </div>
                        <div className="px-4 mt-2 mx-auto justify-end">
                            <button onClick={makeFullScreen} type="button" class="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 mr-2 mb-2">
                                <FaExpand />
                            </button>


                            <button onClick={handleCompile} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
                                {

                                    processing ?
                                        <>
                                            <svg role="status" class="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                            </svg>
                                            running...
                                        </>
                                        :
                                        "F9 -  Run Code"

                                }
                            </button>


                            <button onClick={downloadTxtFile} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
                                CTRL+q - Save Code
                            </button>

                            <button onClick={resetCode} type="button" class="text-white bg-[#FF9119] hover:bg-[#FF9119]/80 focus:ring-4 focus:outline-none focus:ring-[#FF9119]/50 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center dark:hover:bg-[#FF9119]/80 dark:focus:ring-[#FF9119]/40 mr-2 mb-2">
                                Reset
                            </button>
                            <button onClick={handleShare} type="button" class="text-white bg-[#FF9119] hover:bg-[#FF9119]/80 focus:ring-4 focus:outline-none focus:ring-[#FF9119]/50 font-medium rounded-lg text-sm px-5 py-2 text-center inline-flex items-center dark:hover:bg-[#FF9119]/80 dark:focus:ring-[#FF9119]/40 mr-2 mb-2">
                                Share
                            </button>
                            {/* <RWebShare
                                data={{
                                    text: "Web Share - GfG",
                                    url: "http://localhost:3000",
                                    title: "GfG",
                                    files: [new File([code], 'codetext.txt', { type: "text/plain", })]
                                }}
                                onClick={() => console.log("shared successfully!")}
                            >
                                <button>Share on Web</button>
                            </RWebShare> */}

                        </div>
                    </div >
                </>
            }


            < div className="flex flex-row space-x-4 items-start px-4 py-3" >
                <div className="flex flex-col w-full h-full justify-start items-end">
                    <CodeEditorWindow
                        code={code}
                        onChange={onChange}
                        language={language?.value}
                        theme={theme.value}
                        isFullScreen={fullScreen}
                    />
                </div>
                <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
                    {
                        fullScreen && <button onClick={makeFullScreen} type="button" class="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center  dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 mr-2 mb-2"
                            style={{
                                width: "fit-content"
                            }}>
                            {
                                fullScreen ? <FaCompress /> : <FaExpand />

                            }
                        </button>
                    }
                    <OutputWindow outputDetails={outputDetails} />
                    <div className="flex flex-col items-end">
                        <CustomInput
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                        />
                        {fullScreen && <button
                            onClick={handleCompile}
                            disabled={!code || processing}
                            className={classnames(
                                "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0 font-bold",
                                (!code || processing) ? "opacity-50" : ""
                            )}
                        >
                            {processing ? "Processing..." : "F9 -  Run Code"}
                        </button>}


                    </div>
                    {<OutputDetails runcode={handleCompile} savecode={downloadTxtFile} outputDetails={outputDetails} />}
                </div>
            </div >





        </>

    )
}

export default Landing;



