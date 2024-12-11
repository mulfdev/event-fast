import "dotenv/config";
import assert from "node:assert";
import { createPublicClient, webSocket, type Log } from "viem";
import { mainnet } from "viem/chains";
import { createClient } from "@libsql/client";
import { uniAbi } from "./abi.js";
import { type Abi } from "viem";

type ExtractAbiEventNames<TAbi extends Abi> = Extract<TAbi[number], { type: "event" }>["name"];
type EventNames = ExtractAbiEventNames<typeof uniAbi>;

class EventProcessor {
    #turso: ReturnType<typeof createClient>;
    #queue: { event: EventNames; data: Log }[] = [];
    #batchSize = 100;
    #workers = 5;
    #workersStarted = false;

    constructor(DB_URL: string | undefined, AUTH_TOKEN: string | undefined) {
        if (typeof DB_URL === "undefined" || typeof AUTH_TOKEN === "undefined") {
            throw new Error("DB_URL and AUTH_TOKEN must be defined");
        }

        this.#turso = createClient({
            url: DB_URL,
            authToken: AUTH_TOKEN,
        });
    }

    publish({ event, logs }: { event: EventNames; logs: Log[] }) {
        console.log("Events incoming in this batch:", logs.length);
        console.log("Queue length: ", this.#queue.length);

        for (const log of logs) {
            this.#queue.push({ event, data: log });
        }

        if (this.#workersStarted === false) {
            console.log("starting workers");
            this.startWorkers();
        }
    }

    get queue() {
        return this.#queue;
    }

    async processItem(item: { event: EventNames; data: Log }) {
        switch (item.event) {
            case "Mint": {
                console.log("MINTED", item.data.logIndex);
                break;
            }

            case "Swap": {
                console.log("SWAPPED", item.data.logIndex);
                break;
            }

            case "Burn": {
                break;
            }

            default: {
                console.log("Got unaccounted event");
                break;
            }
        }
    }

    async worker() {
        while (this.#queue.length > 0) {
            const batch = this.#queue.splice(0, this.#batchSize);
            if (batch.length === 0) break;

            await Promise.all(batch.map((item) => this.processItem(item)));
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

    async startWorkers() {
        const workers = Array(this.#workers)
            .fill(null)
            .map(() => this.worker());

        await Promise.all(workers);
    }
}

const client = createPublicClient({
    chain: mainnet,
    transport: webSocket("wss://eth-mainnet.g.alchemy.com/v2/NecRTIDP56Bq5hh_6PMcvmXFX0N1g6Rm"),
});

async function* getLogs({ startBlock, endBlock }: { startBlock: bigint; endBlock: bigint }) {
    let fromBlock = startBlock;
    let toBlock = fromBlock + 800n;

    while (endBlock >= fromBlock) {
        const logs = await client.getLogs({
            events: uniAbi,
            fromBlock,
            toBlock,
        });
        fromBlock += 800n;
        toBlock = fromBlock + 800n;

        assert(fromBlock + 800n === toBlock, "Your math is wrong");

        yield logs;

        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    yield null;
}

const currentBlock = await client.getBlockNumber();
const processor = new EventProcessor(process.env.TURSO_DATABASE_URL, process.env.TURSO_AUTH_TOKEN);
for await (const data of getLogs({ startBlock: 12370624n, endBlock: currentBlock })) {
    if (!data) {
        break;
    }
    if (!data[0]?.eventName) {
        break;
    }

    processor.publish({ event: data[0]?.eventName, logs: data });
}

process.exit(0);
