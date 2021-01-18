import React from "react";

/**
 * Generic, customizable table component
 * @param {Array<string>} props.headers : Column headers
 * @param {Array<Array<string>>} props.rows : Row and cell information
 */
export const Table = (headers, rows) => {
    return (
        <div >
            <table>
                <thead>
                    <tr>
                        {Object.values(headers).map((header) => { return (<th>{header}</th>) })}
                    </tr>
                </thead>
                <tbody>
                    {
                        rows.map((row) => {
                            return (
                                < tr onClick={row.onClick} key={row.key} >
                                    {
                                        Object.values(row.values).map((cell) => { return <td>{String(cell)}</td> })
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