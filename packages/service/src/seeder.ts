import { DomainModel, UserModel, OrganizationModel } from "@cellsinbox/db";

export async function seedPrimaryTenantIfMissing(): Promise<void> {
  const domainName = "cellsweb.com";
  let org = await OrganizationModel.findOne({ slug: "cellsweb" });
  if (!org) {
    org = await OrganizationModel.create({
      name: "CellsWeb Technologies",
      slug: "cellsweb",
      status: "ACTIVE",
      customWebmailDomains: ["webmail.cellsweb.com"],
      maxDomains: 5,
      maxUsers: 50,
      maxStorageBytes: 107374182400,
      branding: {
        companyName: "CellsWeb Sovereign Mail",
        primaryColor: "#0284c7",
        logoUrl: "https://cellsweb.com/logo.png",
      },
      policyConfig: {
        enforceTwoFactor: false,
        spamThresholdScore: 5,
        rejectUnverifiableSpf: false,
        rejectUnverifiableDkim: false,
      },
    });
    console.log(`[Seeder] Created primary organization: ${org.name}`);
  }

  const dkimPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCp7/cuuugd/5If
Gpv7zAbFnyMio6MedtPFMtj57j0nPw0Q5FwptRC0L98gjrsjJgLGBILEGbHyztJ4
EPQaADqnGQFmf+AIUZvmDBCL9yiPptDmh95PyZ5wKKsUJ0jwoKFZ6RcmPsqYvibk
VYaJHTlevQlO0+uE64ojtMO0Rx8ij82duAN9FFsmhuw9kf1GDgVA94N60b6eLz56
tH4jDpA9Q7nDjHfuGo8qAzLxB8wS/f4SPqELBqlUKgXDU26hAjeEdPht2JIgdO9L
3FtrfEdoBvlVr7n7LzzoY5uFdEC+VlpmGsp6jhff25iXvbZnOmLk+EsOse1alAw+
Ii27nvvtAgMBAAECggEAH9u1GR1goSkVvX+JURv3hAp4tYh8btxjiKNm8noDnG0x
V6KcFZSUkFcuKyYe9rCsUe+sDTPs/KJh6jDxdkNnO4bQUKU1/JFCGw9Vdcvs3ntt
S96aYpZffdLd+b4Aql3OyfKNDLY2WIrDc0iGW4OvSu/BBDZt/6IBqH59tvkjYODK
XU2201Jz2Eu+kKpHZifpBpejmBieCMTmLjofN4KKBgoQMKX0jGp36fWuhPdsg3GC
oWEEqs5TgoUuNta29ufvHQXhWUNMG36hW3Zro93nTseKDJ/wEPy8VhsgkyRBd1S0
qCcyTsxksHjW26ZrBfEOt2JmRM/fsQ06z8jL/xOMeQKBgQDsm06Fi9gyJXPuuNV4
eD8P7H7JA8qK9zb62lVvGe326ryByQxQ/kmRQXBgs13aUHFsVpZiGasBj9DLZ0Ji
9LEIgYuM3DFyuC0y/grU3mzueQOG1RYFwv14eYFxuRUZmDX5tGBtR6oFaOA0syF0
9oXpMgeBd2Y4eD9/a6OaOL/nmQKBgQC33b5nBDSz13pUsbr9vTte+vnrg4/dRcJo
mQvYTRhg2Az09u3p45x05qDoMwHbvR7pV3EiBT2/qLSJxYaaV4qiVgMmhl9EJWVc
1y0NVxvQdQ/RMy2d7R1rTHpvuCdR3zjgUcz7a1pkLViNh4S4/c/bMCNmno81/hn7
anOJnIUbdQKBgFa53qBI0CghXktEaMrNmJ/nmdlokFc7omV0nhgpMvZsuEgCP4d4
jdK2X9CyLlaVYd3KJzkyG2JpKqlD4iuPcUyi31n0ZBOeusKUJ7g7B0aqCMblWDso
a+w67V2X78n/5tjuauHjgMiW1oe6mSrcKd1+Pw4Pi+JrAStdcwxWfNERAoGBAJH+
ip814bsjT8lMTpQH28qxMhzlnCgwqgtv6s3XeZH8O12PbJ4Y0zSnpAB77+/RHWhe
vEAtNTin9qKmqxiGhlgcP+gpLh/oKbIsUWOUVUuSh/quznvluURnt5hZ+y6xNnI3
wbGpLl74+qV2g9Z4AsGiWZm0MTbIC01s20zbcX25AoGAXrj/xIoOQn2DowI36NkD
xXlntUQbHHk2YmROhtD4YH69kGuL3EG9rVAWfaFibxFbVXsF9AFgf+VkLatrwwA2
BdcvIMPwxci3iykww3bf1WWm3Ocp2dS/pIfwAbSIVN5Hz7vUAEjOr3bMwVl66EYK
CQBoTbVGH50tJez2nIs+A9I=
-----END PRIVATE KEY-----`;

  const dkimPublicKey = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqe/3LrroHf+SHxqb+8wGxZ8jIqOjHnbTxTLY+e49Jz8NEORcKbUQtC/fII67IyYCxgSCxBmx8s7SeBD0GgA6pxkBZn/gCFGb5gwQi/coj6bQ5ofeT8mecCirFCdI8KChWekXJj7KmL4m5FWGiR05Xr0JTtPrhOuKI7TDtEcfIo/NnbgDfRRbJobsPZH9Rg4FQPeDetG+ni8+erR+Iw6QPUO5w4x37hqPKgMy8QfMEv3+Ej6hCwapVCoFw1NuoQI3hHT4bdiSIHTvS9xba3xHaAb5Va+5+y886GObhXRAvlZaZhrKeo4X39uYl722Zzpi5PhLDrHtWpQMPiItu5777QIDAQAB`;

  let domain = await DomainModel.findOne({ name: domainName }).select("+dkimPrivateKey");
  if (!domain) {
    domain = await DomainModel.create({
      organizationId: org._id,
      name: domainName,
      isVerified: true,
      verificationToken: "cellsweb-verify-token-root-2026",
      dkimSelector: "ci",
      dkimPrivateKey,
      dkimPublicKey,
      spfStatus: "VERIFIED",
      dkimStatus: "VERIFIED",
      dmarcStatus: "VERIFIED",
      mxStatus: "VERIFIED",
    });
    console.log(`[Seeder] Seeded verified domain: ${domain.name}`);
  } else if (!domain.isVerified || !domain.dkimPrivateKey) {
    domain.isVerified = true;
    domain.dkimPrivateKey = dkimPrivateKey;
    domain.dkimPublicKey = dkimPublicKey;
    domain.dkimSelector = "ci";
    domain.spfStatus = "VERIFIED";
    domain.dkimStatus = "VERIFIED";
    domain.mxStatus = "VERIFIED";
    await domain.save();
    console.log(`[Seeder] Updated domain ${domain.name} with verified status and DKIM credentials.`);
  }

  const adminEmail = "minhazur@cellsweb.com";
  let user = await UserModel.findOne({ email: adminEmail });
  if (!user) {
    user = await UserModel.create({
      organizationId: org._id,
      domainId: domain._id,
      email: adminEmail,
      displayName: "Minhazur Rahman",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$Bz20UOK5Hu7dLQFOun2wUQ$ZR/I2UpJYv/CLkdh+UzNtHc84VZMyK4DXx2bs+PU834",
      role: "ORG_ADMIN",
      status: "ACTIVE",
      twoFactorEnforced: false,
      storageQuotaBytes: 10737418240,
      storageUsedBytes: 0,
      preferences: {
        signature: "-- \nMinhazur Rahman\nLead Architect @ CellsWeb",
        autoSaveDrafts: true,
        sendReadReceipts: true,
        desktopNotifications: true,
        defaultFormat: "html",
        theme: "dark",
      },
    });
    console.log(`[Seeder] Created primary admin user: ${user.email}`);
  }
}
