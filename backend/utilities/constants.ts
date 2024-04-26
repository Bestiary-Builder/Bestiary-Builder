//Express app
import express from "express";
export const app = express();

//Is production
export const isProduction = (process.env.NODE_ENV == "production") as boolean;

//Bad-words filter
import BadWordsNext from "bad-words-next";
export const badwords = new BadWordsNext({placeholder: ""});
import ar from "../staticData/badwordsData/ar.json";
badwords.add(ar);
import ch from "../staticData/badwordsData/ch.json";
badwords.add(ch);
import cs from "../staticData/badwordsData/cs.json";
badwords.add(cs);
import da from "../staticData/badwordsData/da.json";
badwords.add(da);
import de_2 from "../staticData/badwordsData/de_2.json";
badwords.add(de_2);
import de from "../staticData/badwordsData/de.json";
badwords.add(de);
import en_2 from "../staticData/badwordsData/en_2.json";
badwords.add(en_2);
import en from "../staticData/badwordsData/en.json";
badwords.add(en);
import eo from "../staticData/badwordsData/eo.json";
badwords.add(eo);
import escopy from "../staticData/badwordsData/es copy.json";
badwords.add(escopy);
import es from "../staticData/badwordsData/es.json";
badwords.add(es);
import fa from "../staticData/badwordsData/fa.json";
badwords.add(fa);
import fi from "../staticData/badwordsData/fi.json";
badwords.add(fi);
import fil from "../staticData/badwordsData/fil.json";
badwords.add(fil);
import fr_2 from "../staticData/badwordsData/fr_2.json";
badwords.add(fr_2);
import frCAusdcaqc from "../staticData/badwordsData/fr-CA-u-sd-caqc.json";
badwords.add(frCAusdcaqc);
import fr from "../staticData/badwordsData/fr.json";
badwords.add(fr);
import hi from "../staticData/badwordsData/hi.json";
badwords.add(hi);
import hu from "../staticData/badwordsData/hu.json";
badwords.add(hu);
import it from "../staticData/badwordsData/it.json";
badwords.add(it);
import ja from "../staticData/badwordsData/ja.json";
badwords.add(ja);
import kab from "../staticData/badwordsData/kab.json";
badwords.add(kab);
import ko from "../staticData/badwordsData/ko.json";
badwords.add(ko);
import nl from "../staticData/badwordsData/nl.json";
badwords.add(nl);
import no from "../staticData/badwordsData/no.json";
badwords.add(no);
import pl_2 from "../staticData/badwordsData/pl_2.json";
badwords.add(pl_2);
import pl from "../staticData/badwordsData/pl.json";
badwords.add(pl);
import pt from "../staticData/badwordsData/pt.json";
badwords.add(pt);
import ru_2 from "../staticData/badwordsData/ru_2.json";
badwords.add(ru_2);
import ru_lat from "../staticData/badwordsData/ru_lat.json";
badwords.add(ru_lat);
import ru from "../staticData/badwordsData/ru.json";
badwords.add(ru);
import sv from "../staticData/badwordsData/sv.json";
badwords.add(sv);
import th from "../staticData/badwordsData/th.json";
badwords.add(th);
import tlh from "../staticData/badwordsData/tlh.json";
badwords.add(tlh);
import tr from "../staticData/badwordsData/tr.json";
badwords.add(tr);
import ua from "../staticData/badwordsData/ua.json";
badwords.add(ua);
import zh from "../staticData/badwordsData/zh.json";
badwords.add(zh);

//Secrets:
import fs from "fs";
import crypto from "crypto";
export function generateUserSecret(): string {
	return crypto.randomBytes(64).toString("hex");
}
export const JWTKey = getJWTKey();
function getJWTKey() {
	if (!fs.existsSync(".jwtkey")) {
		let newKey = crypto.randomBytes(128).toString("hex");
		fs.writeFileSync(".jwtkey", newKey);
	}
	return fs.readFileSync(".jwtkey").toString("hex");
}
