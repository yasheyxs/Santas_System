// Global scope definition
const certificate = `-----BEGIN CERTIFICATE-----
MIIDVzCCAj+gAwIBAgIUGwixoN3LVoqLJM+VbRquhbzRoRwwDQYJKoZIhvcNAQEL
BQAwOzELMAkGA1UEBhMCQVIxEDAOBgNVBAgMB0NvcmRvYmExGjAYBgNVBAcMEVZp
bGxhIGRlbCBSb3NhcmlvMB4XDTI1MTIwMTA0MzgzMVoXDTI2MTIwMTA0MzgzMVow
OzELMAkGA1UEBhMCQVIxEDAOBgNVBAgMB0NvcmRvYmExGjAYBgNVBAcMEVZpbGxh
IGRlbCBSb3NhcmlvMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwV7S
PM76sHCtdnRCPrgO/OHqwWtuLWgD5ViNK0SJQDwx/SqDjghwqrepHwZ5ILdMwMw/
Haq35Y+775CeJFhb00GZRGdORHsqFKRPJyr5ANGxogdkaADCZCtCRHi5kGh++dJ5
EP1WY/ebnw1cAiZV4m8LApJCOgOSoDeNdUKaYcOAHQC67+Ozm62ejplWOJrSA45X
EY72RUm1oMp3DjvcvVR2ySdrIMtR8f0sDTbMNrrTa6INpPCq3bsJgAjUZo2jAQ6p
Ne87R2v1MG6d+v03QKVd05m9tsnhOpUIHafDgLn4w5DliGuQ2COW2o9jeZ6IA2lv
60RsSOdkOIntQTpwKwIDAQABo1MwUTAdBgNVHQ4EFgQUnRknqPbetcARB+Olj4h3
0fkwt84wHwYDVR0jBBgwFoAUnRknqPbetcARB+Olj4h30fkwt84wDwYDVR0TAQH/
BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAYPwqTpR8/iJ0349vSwRstCfEKiL2
37jHCOMxYizwKg1X7J8CxVpk2WM1bVG9qMIg6bbgUBEYzf30UMMSYOTQ74KMvUMn
4VUJvtro3veIvIZJMlBP1ZVKTV68orbtPY6LEahpq8+O4UjcYNjBLppE+eypC/JZ
Zd4Sho5lHO4mInPlLfcJtLXhS1lZz7cjiTLgGdLrkM/QwCBKOxq0fd2i+DQ9fR9y
TqngJiFIFtR/VWOnFXoCOkqZBXd/UuKsCfaC0IhSNeiORVb+roO8NZ7QUyNAiyqo
llQ+SUUQBjTs+WrbHHHO+W1eQ3LzRVlO67Z40xaxc8bWvuM6jeMGaQMOEg==
-----END CERTIFICATE-----`;

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDBXtI8zvqwcK12
dEI+uA784erBa24taAPlWI0rRIlAPDH9KoOOCHCqt6kfBnkgt0zAzD8dqrflj7vv
kJ4kWFvTQZlEZ05EeyoUpE8nKvkA0bGiB2RoAMJkK0JEeLmQaH750nkQ/VZj95uf
DVwCJlXibwsCkkI6A5KgN411Qpphw4AdALrv47ObrZ6OmVY4mtIDjlcRjvZFSbWg
yncOO9y9VHbJJ2sgy1Hx/SwNNsw2utNrog2k8KrduwmACNRmjaMBDqk17ztHa/Uw
bp36/TdApV3Tmb22yeE6lQgdp8OAufjDkOWIa5DYI5baj2N5nogDaW/rRGxI52Q4
ie1BOnArAgMBAAECggEAAz7n7JJAgUmVc6GCaqrZRyeGqHdFr5A5/kYxeV/ZP1zk
k/25c8+MN3cfFxPd0VfsiqWESYjAkWC0c8f3NLICqipZmB+852uFgEzgnxXiVFSX
IXbAnuV7uftsOPh7Y0rwSjNdIMg8nefnywEPKWI8YpKRYfuL2wgSexBL96xDXMzx
Hlsx5t7i8VdP7Dt4ksTY9FovWiVJj6fp6Xf3g+fgQnOHLuyesUyv7Tnbon+Zp8Uz
uhw/0By3rQtCYgn/cuPYRis2OFUhTfsE0WAlluxbQ1WJSa1N59g5ULSpbbrH9i8X
eZnM/tZsEU/tzPqmr224UHEEnUibLFMqGQuSPyyV4QKBgQDlFpEaVHKh7xobnpbn
mwWtbDRw0QuOdoe/WixxoOfho22ehWrvi6nJ/RcmXC1sI9zPNxzzMfWgb4+9ByYn
mJJpavN8dEySe6EELku6c2R3tTc1gojYTWXpP0mDeNf1MirVGmbJtD/cp0fHLGCt
RophOxkXT2mJ0dkpfvXBCVH92wKBgQDYFhqr5u3XJyQeDYnO1xPyKm8qC5Czk1KN
kzqDrvKN4UBlcDGx0yQrLYlbqwPY6t9vx2O/0ZxpJYUj+ZCWr2iCPO1Laeva0G19
wgtfqghydzieJM4B6utpOsuabaLxw0KGG3VVZ2APStJRZpFGw7eGKz6ScGWgr9W6
swvtUpHv8QKBgQDe7AfFBFoMI9xW9grIUzzCFiItie5h8guEc939sGMUWXDJKfD2
KwTMrkCBrn7w1TEAXxQHvxzSwtyvR66kJz6J4G4RNCZzAGSd6eL9C16/chLIOj6p
pR8/SrtheQ1E501w02EkdAcU057wPMnSs2ri1JxE55y+ZPqZ+5ZvAn/LswKBgQCz
eKhuXj7sk/XLgDMVOE24tMXfhfuJKrNGIyJWfNe4P33cwnKD33oK4qdTG5b2cx1h
GZofl1jxe9g5KO6OOOH0SeZM3IyoELTf3mrT6cVaTOsZbjgsH5GmtM6mVKkhY6u8
9tFdPZ7rFJnaQfYncCbdqM0vk2rVKzW4+zzMv+e2AQKBgQC9pnXQ+GGsSdQeiFPq
vkvaXOFREPuNOBY2GwB+/9wNGkuPVMxFTHVPfCb3htcPekQJCGAH7vAF8gCxNqbN
ero0JM1uRm9CQYCC3jXWCY/M0H++XzznbH9I43iLH9Xr8oxPjf0FNXcDJR1bMvIz
eeyhXjqFO5uyHX3ktciJDfFG6g==
-----END PRIVATE KEY-----`;

(function () {
  // Load Forge
  function loadForge() {
    return new Promise(function (resolve, reject) {
      if (window.forge) return resolve(window.forge);
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/forge/1.3.1/forge.min.js";
      s.onload = () => resolve(window.forge);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function configure() {
    await loadForge();
    if (!window.qz) return;

    window.qz.security.setCertificatePromise(() =>
      Promise.resolve(certificate)
    );

    window.qz.security.setSignaturePromise(function (data) {
      return new Promise((resolve, reject) => {
        try {
          const pk = forge.pki.privateKeyFromPem(privateKey);
          const md = forge.md.sha256.create();
          md.update(data, "utf8");
          const signature = forge.util.encode64(pk.sign(md));
          console.log("Firma generada:", signature);
          resolve(signature);
        } catch (e) {
          console.error("Error en el proceso de firma:", e);
          reject(e);
        }
      });
    });
  }

  configure();
})();

// Now privateKey is globally accessible, so you can log it here:
console.log(privateKey); // This should log the privateKey value without any issues
