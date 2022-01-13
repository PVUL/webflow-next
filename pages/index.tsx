import Head from 'next/head';
import Link from 'next/link';
import parseHTML, { domToReact } from 'html-react-parser';
import get from 'lodash/get';

const isUrlInternal = (link) => {
  if (
    !link ||
    link.indexOf(`https:`) === 0 ||
    link.indexOf(`#`) === 0 ||
    link.indexOf(`http`) === 0 ||
    link.indexOf(`://`) === 0
  ) {
    return false;
  }
  return true;
};

const replace = (node) => {
  const attribs = node.attribs || {};

  if (node.name === `a` && isUrlInternal(attribs.href)) {
    const { href, ...props } = attribs;
    if (props.class) {
      props.classname = props.class;
      delete props.class;
    }
    return (
      <Link href={href}>
        <a {...props}>
          {!!node.children &&
            !!node.children.length &&
            domToReact(node.children, parseOptions)}
        </a>
      </Link>
    );
  }

  if (node.name === `script`) {
    let content = get(node, `children.0.data`, ``);
    if (content && content.trim().indexOf(`WebFont.load(`) === 0) {
      content = `setTimeout(function(){${content}}, 1)`;
      return (
        <script
          {...attribs}
          dangerouslySetInnerHTML={{ __html: content }}
        ></script>
      );
    }
  }
};

const parseOptions = { replace };

const Home = (props) => {
  // attach custom react component to element
  if (typeof document !== 'undefined') {
    const domContainer = document.getElementById('surprise');
    if (domContainer) domContainer.onclick = showSurprise;
  }

  return (
    <>
      <Head>{parseHTML(props.headContent)}</Head>
      <div dangerouslySetInnerHTML={{ __html: props.bodyContent }} />
    </>
  );
};

const showSurprise = () => {
  // alert(location.hostname);
  console.log('its fucking working!');
};

export const getStaticProps = async (ctx) => {
  const cheerio = await import(`cheerio`);
  const axios = (await import(`axios`)).default;

  let url = get(ctx, `params.path`, []);
  url = url.join(`/`);
  if (url.charAt(0) !== `/`) {
    url = `/${url}`;
  }
  const fetchUrl = process.env.WEBFLOW_URL + url;

  let res = await axios(fetchUrl).catch((err) => {
    console.error(err);
  });
  const html = res.data;

  const $ = cheerio.load(html);
  const bodyContent = $(`body`).html();
  const headContent = $(`head`).html();

  return {
    props: {
      bodyContent,
      headContent,
    },
  };
};

export default Home;
