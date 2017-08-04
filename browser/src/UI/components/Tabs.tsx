/**
 * Tabs.tsx
 */

import * as path from "path"

import * as React from "react"
import { connect } from "react-redux"

import * as classNames from "classnames"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { Icon } from "./../Icon"

require("./Tabs.less") // tslint:disable-line no-var-requires

export interface ITabProps {
    id: number
    name: string
    description: string
    isSelected: boolean
    isDirty: boolean
}

export interface ITabContainerProps {
    onBufferSelect?: (bufferId: number) => void
    onBufferClose?: (bufferId: number) => void
}

export interface ITabsProps extends ITabContainerProps {
    visible: boolean
    tabs: ITabProps[]
}

export class Tabs extends React.PureComponent<ITabsProps, void> {
    public render(): JSX.Element {
        if (!this.props.visible) {
            return null
        }

        const tabBorderStyle = {
            "borderBottom": "4px solid rgb(40, 44, 52)",
        }

        const tabs = this.props.tabs.map((t) => {
            return <Tab key={t.id} {...t} onClickName={() => this._onSelect(t.id)} onClickClose={() => this._onClickClose(t.id)}/>
        })

        return <div className="tabs horizontal enable-mouse layer" style={tabBorderStyle}>
            {tabs}
        </div>
    }

    private _onSelect(id: number): void {
        this.props.onBufferSelect(id)
    }

    private _onClickClose(id: number): void {
        this.props.onBufferClose(id)
    }
}

export interface ITabPropsWithClick extends ITabProps {
    onClickName: React.EventHandler<React.MouseEvent<HTMLDivElement>>
    onClickClose: React.EventHandler<React.MouseEvent<HTMLDivElement>>
}

export const Tab = (props: ITabPropsWithClick) => {
    const cssClasses = classNames("tab", {
        "selected": props.isSelected,
        "not-selected": !props.isSelected,
        "is-dirty": props.isDirty,
        "not-dirty": !props.isDirty,
    })

    return <div className={cssClasses} title={props.description}>
        <div className="corner"></div>
        <div className="name" onClick={props.onClickName}>{props.name}</div>
        <div className="corner enable-hover" onClick={props.onClickClose}>
            <div className="x-icon-container">
                <Icon name="times" />
            </div>
            <div className="circle-icon-container">
                <div className="circle" />
            </div>
        </div>
    </div>
}

const getTabName = (name: string): string => {
    if (!name) {
        return "[No Name]"
    }

    return path.basename(name)
}

import { createSelector } from "reselect"

const getBufferState = (state: State.IState) => state.buffers

const getTabsFromBuffers = createSelector(
    [getBufferState],
    (buffers) => {
        const allBuffers = Selectors.getAllBuffers(buffers)
        const tabs = allBuffers.map((buf): ITabProps => ({
            id: buf.id,
            name: getTabName(buf.file),
            isSelected: buf.id === buffers.activeBufferId,
            isDirty: buf.version > buf.lastSaveVersion,
            description: buf.file,
        }))
        return tabs
    })

const mapStateToProps = (state: State.IState, ownProps: ITabContainerProps): ITabsProps => {
    const tabs = getTabsFromBuffers(state)

    const visible = state.configuration["tabs.enabled"]

    return {
        ...ownProps,
        visible,
        tabs,
    }
}

export const TabsContainer = connect(mapStateToProps)(Tabs)