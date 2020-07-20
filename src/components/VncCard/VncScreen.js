import React, { Component } from "react";
import RFB from "@novnc/novnc/core/rfb";
import urlTo from "../../util/urlTo";
import isSecure from "../../util/isSecure";

export default class VncScreen extends Component {
    static resizeVnc(rfb) {
        if (rfb) {
            rfb.resizeSession = true;
            rfb.scaleViewport = true;
        }
    }

    static defaultPort({ port, protocol }) {
        return port || (protocol === "https:" ? "443" : "80");
    }

    connection(connection) {
        this.props.onUpdateState(connection);
    }

    onVNCDisconnect = () => {
        this.connection("disconnected");
    };

    onVNCConnect = () => {
        this.connection("connected");
    };

    componentDidMount() {
        const { session, origin } = this.props;
        this.connection("connecting");

        if (origin && session) {
            const link = urlTo(window.location.href);
            console.log('link')
            console.log(link)
            console.log('link.hostname')
            console.log(link.hostname)
            console.log('isSecure')
            console.log(isSecure(link))

            const port = VncScreen.defaultPort(link);
            console.log('port')
            console.log(port)
            console.log('session')
            console.log(session)

            this.disconnect(this.rfb);
            this.rfb = this.createRFB(link, port, session, isSecure(link));
        }
    }

    componentDidUpdate(prevProps) {
        const prevOrigin = prevProps.origin;
        const { session, origin } = this.props;

        if (origin && session && prevOrigin !== origin) {
            const link = urlTo(window.location.href);
            const port = VncScreen.defaultPort(link);

            this.disconnect(this.rfb);
            this.rfb = this.createRFB(link, port, session, isSecure(link));
        }
    }

    componentWillUnmount() {
        this.rfb && this.rfb.removeEventListener("disconnect", this.onVNCDisconnect);
        this.rfb && this.rfb.removeEventListener("connect", this.onVNCConnect);
        this.disconnect(this.rfb);
    }

    createRFB(link, port, session, secure) {
        let hostn = `${link.hostname}`
        hostn = '172.31.50.74'
        port = '4444'
        session = '0aed1c282da51632f51e9da9e6666bf6'
        const rfb = new RFB(this.canvas, `${secure ? "wss" : "ws"}://${hostn}:${port}/vnc/${session}`, {
        //const rfb = new RFB(this.canvas, `${secure ? "wss" : "ws"}://${hostn}:${port}/ws/vnc/${session}`, {
        //const rfb = new RFB(this.canvas, 'ws://localhost:4444/vnc/eb65afc264c6a66a7b8482d2868e4256', {
            credentials: {
                password: "selenoid",
            },
        });

        rfb.addEventListener("connect", this.onVNCConnect);
        rfb.addEventListener("disconnect", this.onVNCDisconnect);

        rfb.scaleViewport = true;
        rfb.resizeSession = true;
        rfb.viewOnly = true;
        return rfb;
    }

    lock(unlocked) {
        if (this.rfb) {
            this.rfb.viewOnly = !unlocked;
        }
    }

    disconnect(rfb) {
        if (rfb && rfb._rfb_connection_state && rfb._rfb_connection_state !== "disconnected") {
            rfb.disconnect();
        }
    }

    render() {
        return (
            <div
                className="vnc-screen"
                ref={screen => {
                    this.canvas = screen;
                    VncScreen.resizeVnc(this.rfb);
                }}
            ></div>
        );
    }
}
