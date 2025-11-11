import c from"@tauri-apps/plugin-sql";const E="vaults.db",o="vaults",l="vault_names";let s=null,n=null;async function r(){if(n||(n=(async()=>{try{const a=E;console.log("Tauri DB Path:",a),s=await c.load(`sqlite:${a}`),await s.execute(`
          CREATE TABLE IF NOT EXISTS ${o} (
            name TEXT PRIMARY KEY,
            data TEXT
          )
        `),await s.execute(`
          CREATE TABLE IF NOT EXISTS ${l} (
            name TEXT PRIMARY KEY
          )
        `)}catch(a){throw n=null,new Error(`Failed to initialize Tauri database: ${a.message}`)}})()),await n,!s)throw new Error("Tauri database instance is null after initialization.");return s}const w={async getVaultNames(){try{return(await(await r()).select(`SELECT name FROM ${l}`)).map(e=>e.name)}catch(a){throw new Error(`Failed to get vault names from Tauri DB: ${a.message}`)}},async saveVaultNames(a){try{const t=await r();await t.execute(`DELETE FROM ${l}`);for(const e of a)await t.execute(`INSERT OR IGNORE INTO ${l} (name) VALUES (?)`,[e])}catch(t){throw new Error(`Failed to save vault names to Tauri DB: ${t.message}`)}},async getVault(a){try{const e=await(await r()).select(`SELECT data FROM ${o} WHERE name = ?`,[a]);return e.length>0?JSON.parse(e[0].data):null}catch(t){throw new Error(`Failed to get vault '${a}' from Tauri DB: ${t.message}`)}},async saveVault(a,t){try{await(await r()).execute(`INSERT OR REPLACE INTO ${o} (name, data) VALUES (?, ?)`,[a,JSON.stringify(t)]);const i=await this.getVaultNames();i.includes(a)||await this.saveVaultNames([...i,a])}catch(e){throw new Error(`Failed to save vault '${a}' to Tauri DB: ${e.message}`)}},async deleteVault(a){try{await(await r()).execute(`DELETE FROM ${o} WHERE name = ?`,[a]);const e=await this.getVaultNames();await this.saveVaultNames(e.filter(i=>i!==a))}catch(t){throw new Error(`Failed to delete vault '${a}' from Tauri DB: ${t.message}`)}}};export{w as dbService};
