import MetaplexFilesPageClient from './page-client';

type Props = Readonly<{
    params: Promise<{
        address: string;
    }>;
}>;

export default async function MetaplexFilesPage(props: Props) {
    const params = await props.params;
    return <MetaplexFilesPageClient params={params} />;
}
