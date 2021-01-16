import React from "react";

/**
 * A simple table component
 * @param {Array<string>} headers : Column headers
 * @param {Array<Array<string>>} rows : Row and column information
 */
export const Table = (headers, rows) => {
    return (
        <div height="50px" overflow="scroll" >
            <table>
                <thead>
                    <tr>
                        {headers.map((header) => { return (<th>{header}</th>) })}
                    </tr>
                </thead>
                <tbody>
                    {
                        rows.map((row) => {
                            return (
                                < tr onClick={row.onClick} title="asdsad" >
                                    {
                                        row.values.map((cell) => { return <td>{String(cell)}</td> })
                                    }
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div >
    )
}