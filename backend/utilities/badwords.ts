// Badwords check function
// Bad-words filter
import BadWordsNext from "bad-words-next";
import ar from "@/staticData/badwordsData/ar.json";
import ch from "@/staticData/badwordsData/ch.json";
import cs from "@/staticData/badwordsData/cs.json";
import da from "@/staticData/badwordsData/da.json";
import de_2 from "@/staticData/badwordsData/de_2.json";
import de from "@/staticData/badwordsData/de.json";
import en_2 from "@/staticData/badwordsData/en_2.json";
import en from "@/staticData/badwordsData/en.json";
import eo from "@/staticData/badwordsData/eo.json";
import escopy from "@/staticData/badwordsData/es copy.json";
import es from "@/staticData/badwordsData/es.json";
import fa from "@/staticData/badwordsData/fa.json";
import fi from "@/staticData/badwordsData/fi.json";
import fil from "@/staticData/badwordsData/fil.json";
import fr_2 from "@/staticData/badwordsData/fr_2.json";
import frCAusdcaqc from "@/staticData/badwordsData/fr-CA-u-sd-caqc.json";
import fr from "@/staticData/badwordsData/fr.json";
import hi from "@/staticData/badwordsData/hi.json";
import hu from "@/staticData/badwordsData/hu.json";
import it from "@/staticData/badwordsData/it.json";
import ja from "@/staticData/badwordsData/ja.json";
import kab from "@/staticData/badwordsData/kab.json";
import ko from "@/staticData/badwordsData/ko.json";
import nl from "@/staticData/badwordsData/nl.json";
import no from "@/staticData/badwordsData/no.json";
import pl_2 from "@/staticData/badwordsData/pl_2.json";
import pl from "@/staticData/badwordsData/pl.json";
import pt from "@/staticData/badwordsData/pt.json";
import ru_2 from "@/staticData/badwordsData/ru_2.json";
import ru_lat from "@/staticData/badwordsData/ru_lat.json";
import ru from "@/staticData/badwordsData/ru.json";
import sv from "@/staticData/badwordsData/sv.json";
import th from "@/staticData/badwordsData/th.json";
import tlh from "@/staticData/badwordsData/tlh.json";
import tr from "@/staticData/badwordsData/tr.json";
import ua from "@/staticData/badwordsData/ua.json";
import zh from "@/staticData/badwordsData/zh.json";

export const badwords = new BadWordsNext({ placeholder: "", specialChars: /[\d!@#$%^&*()[\];:'",.?\-_=+~`|]|the|el|la/ });
export function checkBadwords(value: string): string | undefined {
	const usedBadwords: string[] = [];
	badwords.filter(value, (badword) => {
		usedBadwords.push(badword);
	});
	if (usedBadwords.length > 0)
		return `includes blocked words or phrases. Remove the badwords or make the bestiary private. Matched: ${usedBadwords.join(", ")}. If you think this was a mistake, please file a bug report.`;
	else return undefined;
}
badwords.add(ar);
badwords.add(ch);
badwords.add(cs);
badwords.add(da);
badwords.add(de_2);
badwords.add(de);
badwords.add(en_2);
badwords.add(en);
badwords.add(eo);
badwords.add(escopy);
badwords.add(es);
badwords.add(fa);
badwords.add(fi);
badwords.add(fil);
badwords.add(fr_2);
badwords.add(frCAusdcaqc);
badwords.add(fr);
badwords.add(hi);
badwords.add(hu);
badwords.add(it);
badwords.add(ja);
badwords.add(kab);
badwords.add(ko);
badwords.add(nl);
badwords.add(no);
badwords.add(pl_2);
badwords.add(pl);
badwords.add(pt);
badwords.add(ru_2);
badwords.add(ru_lat);
badwords.add(ru);
badwords.add(sv);
badwords.add(th);
badwords.add(tlh);
badwords.add(tr);
badwords.add(ua);
badwords.add(zh);
