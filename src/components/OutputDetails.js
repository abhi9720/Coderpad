import React from "react";

const OutputDetails = ({ outputDetails }) => {
    return (
        <>

            <div className={outputDetails ? "flex justify-between" : "flex justify-end"} >
                {
                    outputDetails &&
                    <div className="metrics-container mt-4 flex flex-col space-y-3">
                        <p className="text-sm">
                            Status:{" "}
                            <span className="font-semibold px-2 py-1 rounded-md bg-gray-100">
                                {outputDetails?.status?.description}
                            </span>
                        </p>
                        <p className="text-sm">
                            Memory:{" "}
                            <span className="font-semibold px-2 py-1 rounded-md bg-gray-100">
                                {outputDetails?.memory}
                            </span>
                        </p>
                        <p className="text-sm">
                            Time:{" "}
                            <span className="font-semibold px-2 py-1 rounded-md bg-gray-100">
                                {outputDetails?.time}
                            </span>
                        </p>
                    </div>
                }


                <div className="flex flex-col items-end">
                    <span className='font-medium text-slate-500 p-1  mt-5  antialiased'>ShortCut</span>
                    <span className="font-semibold  p-1 outline outline-gray-100  rounded-lg antialiased">
                        CTRL+S - Save Code
                    </span>
                    <span className="font-semibold p-1 outline outline-gray-100 mt-2 rounded-lg antialiased">
                        F9 -  Run Code
                    </span>
                </div>

            </div>



        </>
    );
};

export default OutputDetails;