import { IframeHTMLAttributes, useEffect, useMemo, useState } from 'react'
import { doRequest } from '../../requests/request'

interface IAuthenticatedIframeProps extends IframeHTMLAttributes<HTMLIFrameElement> {
  url: string
}

const AuthenticatedIframe = (props: IAuthenticatedIframeProps) => {
  const {url, ...iframeProps} = props;

  const [file, setFile] = useState<Blob>();

  useEffect(() => {
    setFile(undefined);

    return doRequest<Blob>(url, {
      method: 'GET',
      requiresAuth: true,
      responseType: 'blob'
    }, (err, res) => {
      if (res?.ok) {
        setFile(res.data);
      }
    })
  }, [url])

  const iframeUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : undefined;
  }, [file]);

  return <iframe
    {...iframeProps}
    src={iframeUrl}
  />
}

export default AuthenticatedIframe
