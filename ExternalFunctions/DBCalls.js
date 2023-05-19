const { Client } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const client = new Client(`${process.env.DBURL}`);
const CryptoJS = require("crypto-js");
const { User } = require("discord.js");
const key = process.env.AESKEY;

client.connect((err) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("connected");
  }
});

const timestamp = Date.now();

function isolder5mins(dbtimestamp) {
  let difference = timestamp - dbtimestamp;
  if (difference > 300600) {
    return true;
  } else return false;
}

async function PWPanelAdd(
  ServerID,
  ServerName,
  TwitterID,
  TwitterUsername,
  CustomID,
  RoleID
) {
  try {
    const text = `INSERT INTO password_panels
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`;
    let res = await client.query(text, [
      ServerID,
      `${ServerName}`,
      TwitterID,
      `${TwitterUsername}`,
      `${CustomID}`,
      RoleID,
      null,
      timestamp,
    ]);
    return 1;
  } catch (error) {
    console.log(
      "ERROR DB1",
      ServerID,
      ServerName,
      TwitterID,
      TwitterUsername,
      CustomID,
      RoleID
    );
    console.log(error);
    return 0;
  }
}

async function PWManyPanelAdd(
  ServerID,
  ServerName,
  TwitterID,
  TwitterUsername,
  CustomID,
  RoleID
) {
  try {
    const text = `INSERT INTO passwordsmany_panels
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`;
    let res = await client.query(text, [
      ServerID,
      `${ServerName}`,
      TwitterID,
      `${TwitterUsername}`,
      `${CustomID}`,
      RoleID,
      null,
      timestamp,
    ]);
    return 1;
  } catch (error) {
    console.log(
      "ERROR DB1",
      ServerID,
      ServerName,
      TwitterID,
      TwitterUsername,
      CustomID,
      RoleID
    );
    console.log(error);
    return 0;
  }
}

async function PWPanelDelete(ServerID) {
  try {
    const text = `DELETE FROM password_panels WHERE "ServerID"=$1;`;
    let res = await client.query(text, [ServerID]);
    return 1;
  } catch (error) {
    console.log("ERROR DB2", ServerID);
    console.log(error);
    return 0;
  }
}

async function PWPanelPull(ServerID) {
  try {
    const text = `SELECT * FROM passwordsmany_panels WHERE "ServerID"=$1`;
    let res = await client.query(text, [ServerID]);

    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.1", ServerID);
    console.log(error);
    return 0;
  }
}

async function PWPanelAddMsgId(CustomID, MessageID) {
  try {
    const text = `UPDATE passwordsmany_panels
        SET "MessageID"=$1
        WHERE "CustomID"=$2`;
    let res = await client.query(text, [MessageID, `${CustomID}`]);
    return 1;
  } catch (error) {
    console.log("ERROR DB4", CustomID, MessageID);
    console.log(error);
    return 0;
  }
}

async function UserInfohalfAdd(discid, twitid) {
  try {
    const text = `INSERT INTO user_info
        VALUES ($1,$2)`;
    let res = await client.query(text, [discid, twitid]);
    return 1;
  } catch (error) {
    console.log("ERROR DB5", discid, twitid);
    console.log(error);
    return 0;
  }
}

async function UserInfoCheck(discid) {
  try {
    const text = `SELECT * FROM user_info WHERE "discordid"=$1`;
    let res = await client.query(text, [discid]);
    const pulled = res.rows;
    if (pulled == "") {
      return 0;
    } else {
      const aesaccess =
        pulled[0].access != null
          ? CryptoJS.AES.decrypt(pulled[0].access, key)
          : null;
      const aessecret =
        pulled[0].secret != null
          ? CryptoJS.AES.decrypt(pulled[0].secret, key)
          : null;
      const decryptedrows = pulled.map((obj) => ({
        discordid: obj.discordid,
        access:
          obj.access != null ? aesaccess.toString(CryptoJS.enc.Utf8) : null,
        secret:
          obj.secret != null ? aessecret.toString(CryptoJS.enc.Utf8) : null,
        twitid: obj.twitid,
        username: obj.username,
        servers: obj.servers,
        AddedTimestamp: obj.AddedTimestamp,
        discordaccess: obj.discordaccess,
        discordexpires: obj.discordexpires,
        discordrefresh: obj.discordrefresh,
        ethwallet: obj.ethwallet,
        solwallet: obj.solwallet,
      }));
      return decryptedrows;
    }
  } catch (error) {
    console.log("ERROR DB6", discid);
    console.log(error);
    return 0;
  }
}

async function UserInfoDelete(discid) {
  try {
    const text = `DELETE FROM user_info WHERE "discordid"=$1`;
    let res = await client.query(text, [discid]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB7", discid);
    console.log(error);
    return 0;
  }
}

async function TwitTempUserDelete(discid) {
  try {
    const text = `DELETE FROM twit_temp_user WHERE discid=$1`;
    let res = await client.query(text, [discid]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB8", discid);
    console.log(error);
    return 0;
  }
}

async function TwitTempUserAdd(discid, uid) {
  try {
    await TwitTempUserDelete(discid);
  } catch (error) {
    console.log(error);
  }
  try {
    const text = `INSERT INTO twit_temp_user
        VALUES ($1, $2, $3);`;
    let res = await client.query(text, [discid, `${uid}`, timestamp]);
    return 1;
  } catch (error) {
    console.log("ERROR DB9", discid, uid);
    console.log(error);
    return 0;
  }
}

async function TwitTempUserFind(uid) {
  try {
    const text = `SELECT * FROM twit_temp_user WHERE "uid"=$1`;
    let res = await client.query(text, [`${uid}`]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB10", uid);
    console.log(error);
    return 0;
  }
}

async function DiscordTempUserDelete(discid) {
  try {
    const text = `DELETE FROM discord_temp_user WHERE discid=$1`;
    let res = await client.query(text, [discid]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB8", discid);
    console.log(error);
    return 0;
  }
}

async function DiscordTempUserAdd(discid, uid) {
  try {
    await DiscordTempUserDelete(discid);
  } catch (error) {
    console.log(error);
  }
  try {
    const text = `INSERT INTO discord_temp_user
        VALUES ($1, $2, $3);`;
    let res = await client.query(text, [discid, `${uid}`, timestamp]);
    return 1;
  } catch (error) {
    console.log("ERROR DB9", discid, uid);
    console.log(error);
    return 0;
  }
}

async function DiscordTempUserFind(uid) {
  try {
    const text = `SELECT * FROM discord_temp_user WHERE "uid"=$1`;
    let res = await client.query(text, [`${uid}`]);

    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB10", uid);
    console.log(error);
    return 0;
  }
}

async function DiscordPullOutDatedTemp() {
  let outdated = [];
  try {
    const text = `SELECT * FROM discord_temp_user`;
    let res = await client.query(text);
    if (res.rows != undefined) {
      for (const row of res.rows) {
        if (isolder5mins(row.Timestamp) == true) {
          outdated.push(row);
        } else {
          return;
        }
      }
    } else {
      return 1;
    }
  } catch (error) {
    console.log("ERROR DB15");
    console.log(error);
    return 0;
  }
  return outdated;
}

async function UserInfoLongAddTwit(
  discid,
  access,
  secret,
  twitid,
  username,
  serversin,
  Timestamp
) {
  const aesaccess = CryptoJS.AES.encrypt(access, key).toString();
  const aessecret = CryptoJS.AES.encrypt(secret, key).toString();
  try {
    const text = `INSERT INTO user_info
          VALUES ($1,$2,$3,$4,$5,$6,$7);`;
    let res = await client.query(text, [
      discid,
      `${aesaccess}`,
      `${aessecret}`,
      twitid,
      `${username}`,
      serversin,
      Timestamp,
    ]);
    return 1;
  } catch (error) {
    console.log(
      "ERROR DB11",
      discid,
      access,
      secret,
      twitid,
      username,
      serversin,
      Timestamp
    );
    console.log(error);
    return 0;
  }
}

async function UserInfoLongAddDisc(
  discid,
  access,
  secret,
  twitid,
  username,
  serversin,
  Timestamp,
  discordacess,
  discordexpires,
  discordrefresh
) {
  try {
    const text = `INSERT INTO user_info
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`;
    let res = await client.query(text, [
      discid,
      access,
      secret,
      twitid,
      username,
      serversin,
      Timestamp,
      discordacess,
      discordexpires,
      discordrefresh,
    ]);
    return 1;
  } catch (error) {
    console.log(
      "ERROR DB11",
      discid,
      access,
      secret,
      twitid,
      username,
      serversin,
      Timestamp,
      discordacess,
      discordexpires,
      discordrefresh
    );
    console.log(error);
    return 0;
  }
}

async function PWPanelPullGuilds() {
  try {
    const text = `SELECT password_panels."ServerID" FROM password_panels`;
    let res = await client.query(text);
    let servers = [];
    for (const server of res.rows) {
      servers.push(server.ServerID);
    }
    console.log(servers);
    return servers;
  } catch (error) {
    console.log("ERROR DB12");
    console.log(error);
    return 0;
  }
}

async function TwitPullOutDatedTemp() {
  let outdated = [];
  try {
    const text = `SELECT * FROM twit_temp_user`;
    let res = await client.query(text);
    if (res.rows != undefined) {
      for (const row of res.rows) {
        if (isolder5mins(row.Timestamp) == true) {
          outdated.push(row);
        } else {
          return;
        }
      }
    } else {
      return 1;
    }
  } catch (error) {
    console.log("ERROR DB15");
    console.log(error);
    return 0;
  }
  return outdated;
}

async function UserInfoPullCreds() {
  try {
    const text = `SELECT discordid, access, secret
    FROM user_info
    WHERE discordid IS NOT NULL 
    AND access IS NOT NULL 
    AND secret IS NOT NULL;;
        `;
    let res = await client.query(text);
    const rows = res.rows;
    const decryptedRows = rows.map((row) => {
      const aesaccess = CryptoJS.AES.decrypt(row.access, key);
      const aessecret = CryptoJS.AES.decrypt(row.secret, key);
      return {
        discordid: row.discordid,
        access: aesaccess.toString(CryptoJS.enc.Utf8),
        secret: aessecret.toString(CryptoJS.enc.Utf8),
      };
    });
    // console.log(decryptedRows.length);
    return decryptedRows;
  } catch (error) {
    console.log("ERROR DB16");
    console.log(error);
    return 0;
  }
}

async function TeamFollowAdd(serverid, discid, channelid) {
  try {
    const text = `INSERT INTO team_followeds (serverid, usertofollow, channeltosend)
        VALUES ($1,$2,$3)`;
    let res = await client.query(text, [serverid, discid, channelid]);
    const rows = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB18", serverid, discid);
    console.log(error);
    return 0;
  }
}

async function TeamFollowPullAll() {
  try {
    const text = `SELECT * FROM team_followeds;`;
    let res = await client.query(text);
    const rows = res.rows;
    return rows;
  } catch (error) {
    console.log("ERROR DB14.01");
    console.log(error);
    return 0;
  }
}

async function TeamFollowDelete(serverid) {
  try {
    const text = `DELETE FROM team_followeds
        WHERE team_followeds.serverid = $1       
        `;
    let res = await client.query(text, [serverid]);
    const rows = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB14.2", serverid);
    console.log(error);
    return 0;
  }
}

async function PWsAddPW(
  pw,
  serverid,
  uses,
  twitter,
  expirestimestamp,
  createdby,
  customId,
  panelid
) {
  try {
    const text = `INSERT INTO "passwordsmany" (password, serverid, uses, followtwitter, expirestimestamp, createdby, customid,msgid)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`;

    let res = await client.query(text, [
      pw,
      serverid,
      uses,
      twitter,
      expirestimestamp,
      createdby,
      customId,
      panelid,
    ]);
    const rows = res.rows;
    return 1;
  } catch (error) {
    console.log(
      "ERROR DB19",
      pw,
      serverid,
      uses,
      twitter,
      expirestimestamp,
      createdby,
      customId,
      panelid
    );
    console.log(error);
    return 0;
  }
}

async function PWsCheckPW(pw, serverid, customid) {
  try {
    const text = `SELECT * 
    FROM "passwordsmany" 
    WHERE "password"=$1 
    AND "serverid"=$2 
    AND "customid"=$3;
    `;
    let res = await client.query(text, [pw, serverid, customid]);

    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB20", pw, serverid);
    console.log(error);
    return 0;
  }
}

async function PWsDeductPWuse(pw, serverid, customid) {
  try {
    const text = `UPDATE "passwordsmany" 
    SET "uses" = "uses" - 1
    WHERE "password"=$1 AND "serverid"=$2 AND "customid"=$3;`;
    let res = await client.query(text, [pw, serverid, customid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB21", pw, serverid);
    console.log(error);
    return 0;
  }
}

async function PWsPull() {
  try {
    const text = `SELECT * FROM "passwordsmany";`;
    let res = await client.query(text);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB22", pw, serverid);
    console.log(error);
    return 0;
  }
}

async function PWsDelete(pw, serverid, msgid) {
  try {
    const text = `DELETE FROM "passwordsmany" WHERE "password"=$1 AND "serverid"=$2 AND "msgid"=$3;`;

    let res = await client.query(text, [pw, serverid, msgid]);

    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB23", pw, serverid, msgid);
    console.log(error);
    return 0;
  }
}

async function PWsDeleteServerPWs(serverid) {
  try {
    const text = `DELETE FROM "passwordsmany" WHERE "serverid"=$1`;
    let res = await client.query(text, [serverid]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB23", pw, serverid);
    console.log(error);
    return 0;
  }
}

async function PWsPullServerPWs(serverid) {
  try {
    const text = `SELECT * FROM "passwordsmany" WHERE "serverid"=$1;`;
    let res = await client.query(text, [serverid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB22", serverid);
    console.log(error);
    return 0;
  }
}

async function PWPanelsUpdateGenRole(roleid, serverid, panelid) {
  try {
    const text = `UPDATE passwordsmany_panels
    SET "teamgenrole"=$1
    WHERE "ServerID"=$2
    AND "MessageID"=$3`;
    let res = await client.query(text, [roleid, serverid, panelid]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB23", roleid, serverid, panelid);
    console.log(error);
    return 0;
  }
}

async function PWPanelGenRolePull(msgid) {
  try {
    const text = `SELECT * FROM "passwordsmany_panels" WHERE "MessageID"=$1;`;
    let res = await client.query(text, [msgid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB24", msgid);
    console.log(error);
    return 0;
  }
}

async function PWPanelCheck(msgid) {
  try {
    const text = `SELECT * FROM "passwordsmany_panels" WHERE "MessageID"=$1;`;
    let res = await client.query(text, [msgid]);
    const pulled = res.rows;
    if (pulled.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("ERROR DB25", msgid);
    console.log(error);
    return false;
  }
}

async function TPPullData(ServerID) {
  try {
    const text = `SELECT * FROM twitter_panels WHERE "ServerID"=$1`;
    let res = await client.query(text, [ServerID]);

    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.2", ServerID);
    console.log(error);
    return 0;
  }
}

async function TPAddServer(
  ServerID,
  ServerName,
  TwitterID,
  TwitterUsername,
  CustomID,
  RoleID
) {
  try {
    const text = `INSERT INTO twitter_panels
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`;
    let res = await client.query(text, [
      ServerID,
      `${ServerName}`,
      TwitterID,
      `${TwitterUsername}`,
      `${CustomID}`,
      RoleID,
      null,
      timestamp,
    ]);
    return 1;
  } catch (error) {
    console.log(
      "ERROR DB1",
      ServerID,
      ServerName,
      TwitterID,
      TwitterUsername,
      CustomID,
      RoleID
    );
    console.log(error);
    return 0;
  }
}

async function TPAddMsgID(CustomID, MessageID) {
  try {
    const text = `UPDATE twitter_panels
        SET "MessageID"=$1
        WHERE "CustomID"=$2`;
    let res = await client.query(text, [MessageID, `${CustomID}`]);
    return 1;
  } catch (error) {
    console.log("ERROR DB4", CustomID, MessageID);
    console.log(error);
    return 0;
  }
}

async function DeleteServerRelations(serverid) {
  try {
    const text = `DELETE FROM user_relations
        WHERE user_relations.serverid = $1       
        `;
    let res = await client.query(text, [serverid]);
    const rows = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB14.2", serverid);
    console.log(error);
    return 0;
  }
}

async function TPDeletePanel(ServerID) {
  try {
    const text = `DELETE FROM twitter_panels WHERE "ServerID"=$1;`;
    let res = await client.query(text, [ServerID]);
    return 1;
  } catch (error) {
    console.log("ERROR DB2", ServerID);
    console.log(error);
    return 0;
  }
}

async function TPPullData(ServerID) {
  try {
    const text = `SELECT * FROM twitter_panels WHERE "ServerID"=$1`;
    let res = await client.query(text, [ServerID]);

    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.3", ServerID);
    console.log(error);
    return 0;
  }
}

async function PullUserRelationAmount(discid) {
  try {
    const text = `SELECT COUNT(twitter_panels."ServerID") AS server_count
        FROM user_relations
        INNER JOIN twitter_panels ON twitter_panels."ServerID" = user_relations.serverid
        INNER JOIN user_info ON user_info."discordid" = user_relations.userid
        WHERE user_relations.userid = $1
        GROUP BY user_info.discordid`;
    let res = await client.query(text, [discid]);
    const rows = res.rows;
    if (res.rowCount == 0) {
      return 0;
    } else {
      return rows[0].server_count;
    }
  } catch (error) {
    console.log("ERROR DB13", discid);
    console.log(error);
    return 0;
  }
}

async function AddServerRelation(serverid, discid) {
  try {
    const text = `INSERT INTO user_relations (ServerId, UserId)
        VALUES ($1,$2)
        ON CONFLICT (ServerId, UserId) DO NOTHING;`;
    let res = await client.query(text, [serverid, discid]);
    const rows = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB14.01", serverid, discid);
    console.log(error);
    return 0;
  }
}

async function GAPanelAdd(
  ServerID,
  ServerName,
  TwitterID,
  TwitterUsername,
  CustomID,
  MessageID,
  timestamp,
  winnerrole,
  channelId,
  endtimestamp,
  winneramount,
  gaprize,
  tweetolike,
  tweettort,
  requiredrole,
  createdby,
  ended,
  discordserverneededid,
  discordserverneededname,
  walletneeded,
  ignoredrole
) {
  try {
    const text = `INSERT INTO giveaway_panels
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21);`;
    let res = await client.query(text, [
      ServerID,
      ServerName,
      TwitterID,
      TwitterUsername,
      CustomID,
      MessageID,
      timestamp,
      winnerrole,
      channelId,
      endtimestamp,
      winneramount,
      gaprize,
      tweetolike,
      tweettort,
      requiredrole,
      createdby,
      ended,
      discordserverneededid,
      discordserverneededname,
      walletneeded,
      ignoredrole,
    ]);
    return 1;
  } catch (error) {
    console.log(
      "ERROR DB1",
      ServerID,
      ServerName,
      TwitterID,
      TwitterUsername,
      CustomID,
      MessageID,
      timestamp,
      winnerrole,
      channelId,
      endtimestamp,
      winneramount,
      gaprize,
      tweetolike,
      tweettort,
      requiredrole,
      createdby,
      ended,
      discordserverneededid,
      discordserverneededname,
      walletneeded,
      ignoredrole
    );
    console.log(error);
    return 0;
  }
}

async function GAPullServer(customid) {
  try {
    const text = `SELECT * FROM giveaway_panels WHERE "customid"=$1`;
    let res = await client.query(text, [customid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.4", ServerID);
    console.log(error);
    return 0;
  }
}

async function EntriesAdd(userid, serverid, customid) {
  try {
    const text = `INSERT INTO giveaway_entries
        VALUES ($1,$2,$3);`;
    let res = await client.query(text, [userid, serverid, customid]);
    return 1;
  } catch (error) {
    console.log("ERROR DB1", userid, serverid, customid);
    console.log(error);
    return 0;
  }
}

async function EntryFind(userid, customid) {
  try {
    const text = `SELECT * FROM giveaway_entries WHERE userid = $1 AND customid = $2;`;
    let res = await client.query(text, [userid, customid]);
    return res.rows;
  } catch (error) {
    console.log("ERROR DB1", userid, serverid, customid);
    console.log(error);
    return 0;
  }
}

async function UserRelationsDelete(discid) {
  try {
    const text = `DELETE FROM user_relations
      WHERE user_relations.userid = $1
      `;
    let res = await client.query(text, [discid]);
    const rows = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB14.1", discid);
    console.log(error);
    return 0;
  }
}

async function UserRelationsPullUserServers(discid) {
  try {
    const text = `SELECT serverid FROM user_relations WHERE userid = $1;`;
    let res = await client.query(text, [discid]);
    const rows = res.rows;
    const serverIds = rows.map((obj) => obj.serverid);
    return serverIds;
  } catch (error) {
    console.log("ERROR DB14.2", discid);
    console.log(error);
    return 0;
  }
}

async function DeleteAllUserEntries(discid) {
  try {
    const text = `DELETE FROM giveaway_entries
      WHERE giveaway_entries.userid = $1
      `;
    let res = await client.query(text, [discid]);
    const rows = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB14.1", discid);
    console.log(error);
    return 0;
  }
}

async function DeleteAllPanelEntries(customid) {
  try {
    const text = `DELETE FROM giveaway_entries
      WHERE giveaway_entries.customid = $1
      `;
    let res = await client.query(text, [customid]);
    const rows = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB14.53", customid);
    console.log(error);
    return 0;
  }
}

async function GAPanelDelete(customid) {
  await DeleteAllPanelEntries(customid);
  try {
    const text = `DELETE FROM giveaway_panels
      WHERE giveaway_panels.customid = $1
      `;
    let res = await client.query(text, [customid]);
    const rows = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB14.1", customid);
    console.log(error);
    return 0;
  }
}

async function GAPullOutDated() {
  let outdated = [];
  try {
    const text = `SELECT * FROM giveaway_panels`;
    let res = await client.query(text);
    if (res.rows != undefined) {
      for await (const row of res.rows) {
        const timestamp = Math.round(Date.now() / 1000);
        const endnumber = parseInt(row.endtimestamp);
        const dayold = endnumber + 84600;
        if (timestamp > dayold) {
          outdated.push(row.customid);
        } else {
          continue;
        }
      }
    } else {
      return 1;
    }
  } catch (error) {
    console.log("ERROR DB15");
    console.log(error);
    return 0;
  }
  return outdated;
}

async function EntriesPullGA(customid) {
  try {
    const text = `SELECT * FROM giveaway_entries WHERE "customid"=$1`;
    let res = await client.query(text, [customid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.5", customid);
    console.log(error);
    return 0;
  }
}

async function GAPullActive() {
  let outdated = [];
  try {
    const text = `SELECT * FROM giveaway_panels`;
    let res = await client.query(text);
    if (res.rows != undefined) {
      for await (const row of res.rows) {
        const timestamp = Math.round(Date.now() / 1000);
        if (timestamp < row.endtimestamp) {
          outdated.push(row);
        } else {
          continue;
        }
      }
    } else {
      return 1;
    }
  } catch (error) {
    console.log("ERROR DB15");
    console.log(error);
    return 0;
  }
  return outdated;
}

async function GAUpdateDrawn(customid) {
  try {
    const text = `UPDATE giveaway_panels
    SET "ended"=true
    WHERE "customid"=$1`;
    let res = await client.query(text, [customid]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB15");
    console.log(error);
    return 0;
  }
}

async function EntriesPullGAbyID(messageid) {
  try {
    const text = `SELECT * FROM giveaway_panels WHERE "messageid"=$1`;
    let res = await client.query(text, [messageid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.6", messageid);
    console.log(error);
    return 0;
  }
}

async function UserInfoDiscUpdate(access, expires, refresh, discordid) {
  // console.log(typeof discordid);
  // const numdiscid = parseInt(discordid);
  // console.log(typeof numdiscid);
  try {
    const text = `UPDATE user_info
    SET discordaccess = $1,
     discordexpires = $2,
      discordrefresh = $3
    WHERE discordid = $4;`;
    let res = await client.query(text, [access, expires, refresh, discordid]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB3.7", access, expires, refresh, discordid);
    console.log(error);
    return 0;
  }
}

async function UserInfoTwitUpdate(access, secret, twitid, username, discordid) {
  try {
    const aesaccess = CryptoJS.AES.encrypt(access, key).toString();
    const aessecret = CryptoJS.AES.encrypt(secret, key).toString();
    const text = `UPDATE user_info
    SET access = $1,
     secret = $2,
      twitid = $3,
      username = $4
    WHERE discordid = $5;`;
    let res = await client.query(text, [
      aesaccess,
      aessecret,
      twitid,
      username,
      discordid,
    ]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.8", access, secret, twitid, username, discordid);
    console.log(error);
    return 0;
  }
}

//pull all discord info
async function UserInfoDiscAccessPullAll() {
  try {
    const text = `SELECT *
    FROM public.user_info
    WHERE discordaccess IS NOT NULL
    AND discordexpires IS NOT NULL
    AND discordrefresh IS NOT NULL;`;
    let res = await client.query(text);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function UserInfoRemoveDiscInfo(discordid) {
  try {
    const text = `UPDATE public.user_info
    SET discordaccess = NULL, discordexpires = NULL, discordrefresh = NULL
    WHERE discordid = $1;`;
    let res = await client.query(text, [discordid]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function UserInfoRemoveTwitInfo(discordid) {
  try {
    const text = `UPDATE public.user_info
    SET access = NULL, secret = NULL, twitid = NULL, username = NULL
    WHERE discordid = $1;`;
    let res = await client.query(text, [discordid]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function UserInfoPullNull(discordid) {
  try {
    const text = `SELECT *
    FROM public.user_info
    WHERE discordaccess IS NULL
    AND discordexpires IS NULL
    AND discordrefresh IS NULL
    AND access IS NULL
    AND secret IS NULL
    AND twitid IS NULL
    AND username IS NULL;
    `;
    let res = await client.query(text, [discordid]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function UserInfoAddorUpdateEthWallet(discordid, EthWallet) {
  try {
    const text = `INSERT INTO user_info (discordid, ethwallet)
    VALUES ($1,$2)
    ON CONFLICT (discordid) DO UPDATE SET ethwallet = $2;
    `;
    let res = await client.query(text, [discordid, EthWallet]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function UserInfoAddorUpdateSolWallet(discordid, solWallet) {
  try {
    const text = `INSERT INTO user_info (discordid, solwallet)
    VALUES ($1,$2)
    ON CONFLICT (discordid) DO UPDATE SET solwallet = $2;
    `;
    let res = await client.query(text, [discordid, solWallet]);
    const pulled = res.rows;
    return 1;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function UserInfoPullEthWallet(discordid) {
  try {
    const text = `
    SELECT ethwallet 
    FROM user_info 
    WHERE discordid = $1;
    `;
    let res = await client.query(text, [discordid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function UserInfoPullSolWallet(discordid) {
  try {
    const text = `
    SELECT solwallet 
    FROM user_info 
    WHERE discordid = $1;
    `;
    let res = await client.query(text, [discordid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function PWManyPanelsCheckDupeRole(roleid) {
  try {
    const text = `
    SELECT CASE WHEN EXISTS (
      SELECT 1 
      FROM public.passwordsmany_panels 
      WHERE "RoleID" = $1
    ) THEN 'TRUE' ELSE 'FALSE' END;
    `;
    let res = await client.query(text, [roleid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function PWPanelPullbyMsgid(msgid) {
  try {
    const text = `
    SELECT * 
    FROM public.passwordsmany_panels 
    WHERE "MessageID" = $1; 
    `;
    let res = await client.query(text, [msgid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function PWPanelPullbyCustomid(customid) {
  try {
    const text = `
    SELECT * 
    FROM public.passwordsmany_panels 
    WHERE "CustomID" = $1; 
    `;
    let res = await client.query(text, [customid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function PWManyPanelsCheckOneExists(serverid) {
  try {
    const text = `
    SELECT CASE WHEN EXISTS (
      SELECT 1 
      FROM public.passwordsmany_panels 
      WHERE "ServerID" = $1
    ) THEN 'TRUE' ELSE 'FALSE' END;    
    `;
    let res = await client.query(text, [serverid]);
    const pulled = res.rows;
    return pulled;
  } catch (error) {
    console.log("ERROR DB3.839");
    console.log(error);
    return 0;
  }
}

async function GAAddorUpdateCSVs(CustomID, wallets) {
  try {
    const text = `UPDATE giveaway_panels
        SET "winnerswalletscsv"=$1
        WHERE "customid"=$2`;
    let res = await client.query(text, [wallets, `${CustomID}`]);
    return 1;
  } catch (error) {
    console.log("ERROR DB4", CustomID, wallets);
    console.log(error);
    return 0;
  }
}

async function GAEndedCheck(CustomID) {
  try {
    const text = `SELECT ended FROM giveaway_panels WHERE customid = $1;
    `;
    let res = await client.query(text, [`${CustomID}`]);
    const pulled = res.rows[0].ended;
    return pulled;
  } catch (error) {
    console.log("ERROR DB4", CustomID);
    console.log(error);
    return 0;
  }
}
// async function test() {
//   //delete day old Giveaways
//   const outdated = await GAEndedCheck(
//     "giveaway_714440739773480992_1086225266092818462"
//   );
//   console.log(outdated);
// }
// test();

module.exports = {
  PWPanelAdd,
  PWPanelDelete,
  PWPanelPull,
  PWPanelAddMsgId,
  PWPanelPullbyMsgid,
  UserInfohalfAdd,
  UserInfoCheck,
  UserInfoDelete,
  TwitTempUserDelete,
  TwitTempUserFind,
  TwitTempUserAdd,
  UserInfoLongAddTwit,
  PWPanelPullGuilds,
  TwitPullOutDatedTemp,
  TwitPullOutDatedTemp,
  UserInfoPullCreds,
  TeamFollowAdd,
  TeamFollowPullAll,
  TeamFollowDelete,
  PWsAddPW,
  PWsCheckPW,
  PWsDeductPWuse,
  PWsPull,
  PWsDelete,
  PWsDeleteServerPWs,
  PWsPullServerPWs,
  PWPanelsUpdateGenRole,
  PWPanelGenRolePull,
  PWPanelCheck,
  TPPullData,
  TPAddServer,
  TPAddMsgID,
  DeleteServerRelations,
  TPDeletePanel,
  TPPullData,
  PullUserRelationAmount,
  AddServerRelation,
  GAPanelAdd,
  GAPullServer,
  EntriesAdd,
  EntryFind,
  UserRelationsDelete,
  UserRelationsPullUserServers,
  DeleteAllUserEntries,
  GAPanelDelete,
  GAPullOutDated,
  EntriesPullGA,
  GAPullActive,
  GAUpdateDrawn,
  EntriesPullGAbyID,
  DiscordTempUserDelete,
  DiscordTempUserFind,
  DiscordTempUserAdd,
  DiscordPullOutDatedTemp,
  UserInfoDiscUpdate,
  UserInfoTwitUpdate,
  UserInfoLongAddDisc,
  UserInfoDiscAccessPullAll,
  UserInfoRemoveDiscInfo,
  UserInfoRemoveTwitInfo,
  UserInfoPullNull,
  UserInfoAddorUpdateEthWallet,
  UserInfoPullEthWallet,
  UserInfoAddorUpdateSolWallet,
  UserInfoPullSolWallet,
  PWManyPanelAdd,
  PWManyPanelsCheckDupeRole,
  PWManyPanelsCheckOneExists,
  PWPanelPullbyMsgid,
  PWPanelPullbyCustomid,
  GAAddorUpdateCSVs,
  GAEndedCheck,
};
