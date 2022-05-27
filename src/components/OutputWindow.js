import React from 'react'

const OutputWindow = ({ outputDetails, lang, offlineStatus }) => {

    // console.log(outputDetails.error.indexOf('Timed Out'));
    const getOutput = () => {
        if (outputDetails.language === 'java' || outputDetails.language === 'py') {

            if (outputDetails.error) {
                return (<pre className="px-2 py-1 font-normal text-xs text-red-500">
                    {outputDetails.error}
                </pre>)
            }
            else {
                return (<pre className="px-2 py-1 font-normal text-xs text-green-500">
                    {outputDetails.output}
                </pre>)
            }

        }
        else if (outputDetails) {
            let statusId = outputDetails?.status?.id;

            if (statusId === 6) {
                // compilation error
                return (
                    <pre className="px-2 py-1 font-normal text-xs text-red-500">
                        {atob(outputDetails?.compile_output)}
                    </pre>
                );
            } else if (statusId === 3) {
                return (
                    <pre className="px-2 py-1 font-normal text-xs text-green-500">
                        {atob(outputDetails.stdout) !== null
                            ? `${atob(outputDetails.stdout)}`
                            : null}
                    </pre>
                );
            } else if (statusId === 5) {
                return (
                    <pre className="px-2 py-1 font-normal text-xs text-red-500">
                        {`Time Limit Exceeded`}
                    </pre>
                );
            } else {
                // return (
                //     <pre className="px-2 py-1 font-normal text-xs text-red-500">
                //         {atob(outputDetails?.stderr)}
                //     </pre>
                // );
            }
        }
    };
    return (
        <>
            <h1 className="mt-5 font-bold text-xl bg-clip-text text-transparent mb-2 flex justify-between" style={{ color: "white" }}>
                Output
                {
                    offlineStatus ?
                        <>
                            <span className='text-lg text-[#f43f5e]'  >
                                <span className='text-2xl'>●</span> Internet DisConnected
                            </span>
                        </>
                        :
                        <>
                            <span className='text-lg text-[#4ade80]'  >
                                <span className='text-2xl'>●</span> Internet Connected
                            </span>
                        </>

                }

            </h1>
            <div className="w-full h-60 bg-[#1e293b] rounded-md text-white font-normal text-sm overflow-y-auto">
                {outputDetails ? <>{getOutput()}</> : null}
            </div>
        </>
    );
}

export default OutputWindow