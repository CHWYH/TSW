import { lookup } from "dns";
import { isIP } from "net";

import { eventBus } from "../../bus";
import { dnsHack } from "../../runtime/dns.hack";

beforeAll(() => {
  dnsHack();
});

describe("dns hack test", () => {
  test("dns could work normally", async () => {
    await new Promise((resolve) => {
      lookup("qq.com", (err, address, family) => {
        expect(err).toBeNull();
        expect(isIP(address)).toBeTruthy();
        expect(family).toBeTruthy();
        resolve();
      });
    });
  });

  test("eventBus was informed", async () => {
    await new Promise((resolve, reject) => {
      eventBus.on("DNS_LOOKUP_SUCCESS", (data) => {
        resolve(data);
      });

      eventBus.on("DNS_LOOKUP_ERROR", (err) => {
        reject(err);
      });

      lookup("qq.com", () => {
        // nothing
      });
    });
  });

  test("ipv4 should return immediately", async () => {
    await new Promise((resolve) => {
      const ip = "1.2.3.4";
      lookup(ip, (err, address, family) => {
        expect(err).toBeNull();
        expect(address).toEqual(ip);
        expect(family).toBeTruthy();
        resolve();
      });
    });
  });

  test("ipv6 should return immediately", async () => {
    await new Promise((resolve) => {
      const ip = "::ffff:192.0.2.128";
      lookup(ip, (err, address, family) => {
        expect(err).toBeNull();
        expect(address).toEqual(ip);
        expect(family).toBeTruthy();
        resolve();
      });
    });
  });

  test("a wrong domain should fail", async () => {
    await new Promise((resolve) => {
      const nullDomain = "this.is.not.a.domain";
      lookup(nullDomain, (err) => {
        // error could be "Dns Lookup Timeout"
        // or "getaddrinfo ENOTFOUND this.is.not.a.domain"
        expect(err).toBeTruthy();
        resolve();
      });
    });
  });
});
