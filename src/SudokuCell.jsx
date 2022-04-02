import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

export default class SudokuCell extends React.Component{
    render() {
        const className = classNames("cell", {
            "cell-error": !this.props.isValid,
            "cell-complete": this.props.isValid && this.props.isComplete,
        });
        return (
            <div className={className}>
                <div className="content">
                    <input
                        type="text"
                        value={this.props.value}
                        onChange={this.props.onChange}
                    />
                </div>
            </div>
        );
    }
}

SudokuCell.propTypes = {
    value: PropTypes.oneOf(["", "1", "2", "3", "4", "5", "6", "7", "8", "9"]).isRequired,
    onChange: PropTypes.func.isRequired,
    isValid: PropTypes.bool.isRequired,
    isComplete: PropTypes.bool.isRequired,
}