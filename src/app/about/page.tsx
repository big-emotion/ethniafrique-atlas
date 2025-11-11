import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pourquoi ce site ? | Dictionnaire des Ethnies d'Afrique",
  description:
    "Pourquoi ce site existe et ce qu'il propose. Dictionnaire des ethnies d'Afrique.",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <nav className="mb-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Retour au site
            </Button>
          </Link>
        </nav>
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-bold">À propos du projet</h2>
          <p>
            Le <strong>Dictionnaire des Ethnies d’Afrique</strong> est un projet personnel
            dont l’objectif est de <strong>rendre accessibles et claires les informations sur les peuples d’Afrique</strong>.
          </p>
          <p>
            Avant les nations et les États, il y avait des ethnies, des peuples et des royaumes.
            L’histoire et les frontières les ont parfois effacés, mais ces peuples existent toujours et
            continuent de transmettre leurs langues, leurs cultures et leurs traditions.
          </p>
          <p>
            Aujourd’hui, je collecte progressivement les informations disponibles pour les organiser dans ce dictionnaire.
          </p>
          <p>
            Le travail est long, car il est <strong>difficile de trouver des données fiables sur l’Afrique</strong>,
            mais le but est de centraliser ce savoir et de le rendre simple à consulter.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Contribution et participation</h3>
          <p>
            Pour le moment, le site est alimenté à partir de <strong>fichiers CSV</strong> regroupant les données
            sur les pays, les régions et les ethnies. Je continue à rechercher ces données et à les structurer
            au fur et à mesure.
          </p>
          <p>
            Je suis <strong>ouvert à toutes les propositions ou contributions</strong>, qu’il s’agisse de partager des fichiers CSV,
            des sources, des corrections, ou simplement des idées d’amélioration.
          </p>
          <p>
            Si vous souhaitez aider, n’hésitez pas à me contacter ou à proposer directement sur le{" "}
            <a
              href="https://github.com/big-emotion/ethniafrique-atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              dépôt GitHub du projet
            </a>
            .
          </p>
          <div className="pt-2">
            <Link
              href="https://github.com/big-emotion/ethniafrique-atlas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="default">Participer sur GitHub</Button>
            </Link>
          </div>
        </section>

        {/* English version */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">🇬🇧 English version</h3>
          <h4 className="text-lg font-medium">About the project</h4>
          <p>
            The <strong>Dictionary of African Ethnic Groups</strong> is a personal
            project whose goal is to <strong>make knowledge about Africa clear and accessible</strong>.
          </p>
          <p>
            Before modern nations and states, there were <strong>ethnic groups, peoples, and kingdoms</strong>.
            History and borders have sometimes erased them, yet these peoples still exist today — carrying their
            languages, cultures, and traditions.
          </p>
          <p>
            I am currently collecting and organizing available information to include it in this dictionary.
          </p>
          <p>
            The work is long and challenging because it is <strong>difficult to find reliable data about Africa</strong>,
            but the goal is to bring this knowledge together and make it easy to explore.
          </p>
          <h4 className="text-lg font-medium pt-2">Contribution and participation</h4>
          <p>
            For now, the site is powered by <strong>CSV files</strong> that contain data on countries, regions,
            and ethnic groups. I keep searching and structuring this information over time.
          </p>
          <p>
            I am <strong>open to all kinds of proposals and contributions</strong>, whether it’s sharing CSV data,
            sources, corrections, or improvement ideas. If you’d like to help, feel free to contact me or contribute
            directly through the{" "}
            <a
              href="https://github.com/big-emotion/ethniafrique-atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              GitHub repository
            </a>
            .
          </p>
          <div className="pt-1">
            <Link
              href="https://github.com/big-emotion/ethniafrique-atlas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="default">Contribute on GitHub</Button>
            </Link>
          </div>
        </section>

        {/* Spanish version */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">🇪🇸 Versión en español</h3>
          <h4 className="text-lg font-medium">Acerca del proyecto</h4>
          <p>
            El <strong>Diccionario de los Pueblos de África</strong> es un proyecto personal cuyo objetivo es{" "}
            <strong>hacer que el conocimiento sobre África sea más claro y accesible</strong>.
          </p>
          <p>
            Antes de la creación de las naciones y los estados modernos, existían{" "}
            <strong>etnias, pueblos y reinos</strong>. La historia y las fronteras a veces los han borrado, pero
            estos pueblos siguen existiendo, transmitiendo sus lenguas, culturas y tradiciones.
          </p>
          <p>
            Actualmente estoy recopilando y organizando la información disponible para incluirla en este diccionario.
          </p>
          <p>
            Es un trabajo largo y complejo, ya que es{" "}
            <strong>difícil encontrar datos fiables sobre África</strong>, pero la meta es reunir este conocimiento
            y presentarlo de forma sencilla.
          </p>
          <h4 className="text-lg font-medium pt-2">Contribución y participación</h4>
          <p>
            Por ahora, el sitio se alimenta de <strong>archivos CSV</strong> que contienen datos sobre países, regiones
            y grupos étnicos. Sigo buscando y estructurando esta información poco a poco.
          </p>
          <p>
            Estoy <strong>abierto a todo tipo de propuestas y contribuciones</strong>, ya sea compartir archivos CSV,
            fuentes, correcciones o ideas para mejorar. Si quieres ayudar, puedes contactarme o contribuir directamente
            en el{" "}
            <a
              href="https://github.com/big-emotion/ethniafrique-atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              repositorio de GitHub
            </a>
            .
          </p>
          <div className="pt-1">
            <Link
              href="https://github.com/big-emotion/ethniafrique-atlas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="default">Contribuir en GitHub</Button>
            </Link>
          </div>
        </section>

        {/* Portuguese version */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">🇵🇹 Versão em português</h3>
          <h4 className="text-lg font-medium">Sobre o projeto</h4>
          <p>
            O <strong>Dicionário dos Povos da África</strong> é um projeto pessoal com o objetivo de{" "}
            <strong>tornar o conhecimento sobre a África mais claro e acessível</strong>.
          </p>
          <p>
            Antes da criação das nações e dos estados modernos, existiam <strong>etnias, povos e reinos</strong>.
            A história e as fronteiras, por vezes, os apagaram, mas esses povos ainda existem, preservando suas
            línguas, culturas e tradições.
          </p>
          <p>
            Atualmente, estou coletando e organizando informações disponíveis para incluí-las neste dicionário.
          </p>
          <p>
            É um trabalho demorado, pois é <strong>difícil encontrar dados confiáveis sobre a África</strong>, mas a
            meta é reunir esse conhecimento e torná-lo fácil de explorar.
          </p>
          <h4 className="text-lg font-medium pt-2">Contribuição e participação</h4>
          <p>
            Por enquanto, o site é alimentado por <strong>arquivos CSV</strong> com dados sobre países, regiões e
            grupos étnicos. Continuo pesquisando e estruturando essas informações com o tempo.
          </p>
          <p>
            Estou <strong>aberto a qualquer tipo de proposta ou contribuição</strong>, seja compartilhando arquivos CSV,
            fontes, correções ou ideias de melhoria. Se quiser ajudar, entre em contato comigo ou contribua diretamente
            no{" "}
            <a
              href="https://github.com/big-emotion/ethniafrique-atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              repositório GitHub
            </a>
            .
          </p>
          <div className="pt-1">
            <Link
              href="https://github.com/big-emotion/ethniafrique-atlas"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="default">Contribuir no GitHub</Button>
            </Link>
          </div>
        </section>

        <section className="pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Fait avec émotion pour l&apos;Afrique</span>
            <div className="flex items-center gap-1" aria-label="BIG EMOTION">
              <span className="font-bold text-yellow-500">BIG</span>
              <span className="font-bold text-foreground">EMOTION</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
