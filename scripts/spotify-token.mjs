// One-shot: exchanges a Spotify authorization code for a refresh token.
//
//   node scripts/spotify-token.mjs <client-id> <client-secret>
//
// Spotify refresh tokens do not expire, so this is run once and the result
// goes into the SPOTIFY_REFRESH_TOKEN environment variable. Nothing here is
// written to disk and no secret is committed. Re-run it if the token is ever
// revoked, or if the granted scopes need to change.
//
// The redirect URI must match the one registered on the Spotify app exactly,
// including the port. Spotify requires HTTPS for every redirect URI except
// the loopback address, which is why this is 127.0.0.1 and not localhost.

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPES = "user-read-currently-playing user-read-recently-played";

const [clientId, clientSecret] = process.argv.slice(2);

if (!clientId || !clientSecret) {
    console.error(
        "usage: node scripts/spotify-token.mjs <client-id> <client-secret>",
    );
    process.exit(1);
}

const state = randomBytes(16).toString("hex");

const authUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
        state,
    });

const server = createServer(async (request, response) => {
    const url = new URL(request.url, REDIRECT_URI);

    if (url.pathname !== "/callback") {
        response.writeHead(404).end();
        return;
    }

    const done = (status, message) => {
        response.writeHead(status, { "content-type": "text/plain" });
        response.end(message);
    };

    // The state check is the CSRF guard on the authorization code: without it
    // an attacker can hand you a code minted for their own account.
    if (url.searchParams.get("state") !== state) {
        done(400, "state mismatch — start over");
        console.error("\nstate mismatch. aborted without exchanging.");
        server.close();
        process.exitCode = 1;
        return;
    }

    const error = url.searchParams.get("error");

    if (error) {
        done(400, `spotify returned: ${error}`);
        console.error(`\nspotify returned: ${error}`);
        server.close();
        process.exitCode = 1;
        return;
    }

    const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                authorization:
                    "Basic " +
                    Buffer.from(`${clientId}:${clientSecret}`).toString(
                        "base64",
                    ),
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: url.searchParams.get("code"),
                redirect_uri: REDIRECT_URI,
            }),
        },
    );

    const payload = await tokenResponse.json();

    if (!tokenResponse.ok || !payload.refresh_token) {
        done(500, "token exchange failed — see the terminal");
        console.error(
            `\ntoken exchange failed (${tokenResponse.status}):`,
            JSON.stringify(payload, null, 2),
        );
        server.close();
        process.exitCode = 1;
        return;
    }

    done(200, "done — close this tab and read the terminal");

    console.log("\nSPOTIFY_REFRESH_TOKEN=" + payload.refresh_token);
    console.log("\ngranted scopes: " + payload.scope);
    console.log("put that in Vercel, alongside the id and secret.\n");

    server.close();
});

server.listen(8888, "127.0.0.1", () => {
    console.log("\nopen this in the browser you are signed into Spotify with:\n");
    console.log(authUrl + "\n");
    console.log("waiting on " + REDIRECT_URI + " ...");
});
