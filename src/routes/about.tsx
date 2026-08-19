import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — UNZA Decentralized Sanitation Systems Hub" },
      { name: "description", content: "About the UNZA Sanitation Hub & Laboratory: a centre of excellence for monitoring, evaluation, and research in decentralized sanitation systems." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <article className="container-page max-w-3xl py-16 prose prose-neutral">
        <h1 className="font-display text-4xl font-bold">Decentralized Sanitation Systems Hub</h1>
        <p className="mt-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">University of Zambia (UNZA)</p>

        <h2 className="mt-10 font-display text-2xl font-semibold">Background</h2>
        <p className="mt-3 text-foreground/85">
          Access to safely managed sanitation remains one of the most urgent public-health challenges in Zambia and across sub-Saharan Africa. Decentralised sanitation systems — including on-site sanitation, faecal sludge management, and small-scale treatment technologies — offer context-appropriate solutions for peri-urban and rural communities that are not served by conventional sewerage infrastructure.
        </p>
        <p className="mt-3 text-foreground/85">
          The University of Zambia, through its Sanitation Hub & Laboratory, is positioned to be a national centre of excellence that bridges cutting-edge research with practical implementation, policy engagement, and community empowerment.
        </p>

        <h2 className="mt-10 font-display text-2xl font-semibold">Vision</h2>
        <p className="mt-3 text-foreground/85">
          To be a leading centre of excellence in decentralised sanitation systems research, knowledge management, and capacity building, contributing to universal access to safely managed sanitation in Zambia and the region.
        </p>

        <h2 className="mt-10 font-display text-2xl font-semibold">Mission</h2>
        <p className="mt-3 text-foreground/85">
          To generate and disseminate evidence-based knowledge, build institutional and community capacity, and facilitate policy engagement that accelerates the adoption of sustainable, equitable, and contextually appropriate sanitation solutions.
        </p>

        <h2 className="mt-10 font-display text-2xl font-semibold">Core functions</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border p-5">
            <h3 className="font-semibold">1. Research & Innovation</h3>
            <p className="mt-1 text-sm text-foreground/80">Conduct applied and interdisciplinary research on sanitation technologies, faecal sludge management, water quality, hygiene behaviour, and public health outcomes. Develop, test, and document locally appropriate technical solutions.</p>
          </div>
          <div className="rounded-lg border border-border p-5">
            <h3 className="font-semibold">2. Knowledge Management & Capacity Building</h3>
            <p className="mt-1 text-sm text-foreground/80">Curate and disseminate sanitation knowledge products through this web-based database. Deliver training programmes for government officers, NGO practitioners, engineers, and community workers. Support student research and academic publishing.</p>
          </div>
          <div className="rounded-lg border border-border p-5">
            <h3 className="font-semibold">3. Policy Engagement</h3>
            <p className="mt-1 text-sm text-foreground/80">Translate research into actionable recommendations for national policy and regulatory frameworks. Engage with the Ministry of Water Development and Sanitation, NWASCO, local authorities, and development partners.</p>
          </div>
          <div className="rounded-lg border border-border p-5">
            <h3 className="font-semibold">4. Monitoring, Evaluation & Behaviour Change</h3>
            <p className="mt-1 text-sm text-foreground/80">Develop and apply M&E frameworks for sanitation projects. Track sanitation coverage, service levels, and hygiene behaviour change. Manage demonstration sites as living laboratories for technology testing and community engagement.</p>
          </div>
        </div>

        <h2 className="mt-10 font-display text-2xl font-semibold">The web-based database</h2>
        <p className="mt-3 text-foreground/85">
          This platform provides structured storage, categorisation, retrieval, and dissemination of sanitation-related knowledge products. It is designed to be:
        </p>
        <ul className="mt-3 list-disc pl-6 text-foreground/85">
          <li>Accessible across desktop and mobile devices</li>
          <li>Searchable and filterable by content type, category, date, and institution</li>
          <li>Open to all for browsing; downloadable resources require a free account</li>
          <li>Governed by a clear content workflow — from draft to publication — with role-based access control</li>
          <li>Integrated with UNZA's Active Directory for staff and student single sign-on</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl font-semibold">Demonstration sites</h2>
        <p className="mt-3 text-foreground/85">
          The Hub manages a network of physical demonstration sites across Zambia where decentralised sanitation technologies are installed, monitored, and studied. These sites serve as:
        </p>
        <ul className="mt-3 list-disc pl-6 text-foreground/85">
          <li>Real-world testing environments for innovative technologies</li>
          <li>Training locations for students, engineers, and community practitioners</li>
          <li>Data sources for longitudinal research and performance assessment</li>
          <li>Engagement points for community education and behaviour change communication</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl font-semibold">Target users</h2>
        <ul className="mt-3 list-disc pl-6 text-foreground/85">
          <li><strong>UNZA students and staff</strong> — authenticated via institutional Active Directory (LDAP)</li>
          <li><strong>Government officers and policy makers</strong> — accessing policy documents and M&E reports</li>
          <li><strong>NGOs and development partners</strong> — accessing guidelines, case studies, and research data</li>
          <li><strong>Community organisations</strong> — accessing training materials and hygiene promotion resources</li>
          <li><strong>General public</strong> — browsing published resources with a free account</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl font-semibold">Contact</h2>
        <p className="mt-3 text-foreground/85">
          Department of Civil and Environmental Engineering<br />
          School of Engineering, University of Zambia<br />
          Great East Road Campus, Lusaka<br />
          <a href="mailto:sanitation@unza.zm" className="text-primary hover:underline">sanitation@unza.zm</a>
        </p>
      </article>
    </PublicLayout>
  ),
});
