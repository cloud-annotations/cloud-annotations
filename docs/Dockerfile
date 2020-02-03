FROM nginx

EXPOSE 80

# Ruby
RUN apt-get -y update && apt-get -y install ruby-full build-essential
# RUN apt-get -y install ruby ruby-dev build-essential nodejs

ENV GEM_HOME "$HOME/gems"
ENV PATH "$HOME/gems/bin:$PATH"

# Jekyll
# RUN gem install jekyll bundler octopress-autoprefixer
RUN gem install jekyll bundler

# Environment
ENV LC_ALL C.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

ADD . /tmp/jekyll-site
WORKDIR /tmp/jekyll-site
RUN bundle install
RUN JEKYLL_ENV=production bundle exec jekyll build
RUN cp /tmp/jekyll-site/nginx/default.conf /etc/nginx/conf.d/default.conf
RUN cp -r /tmp/jekyll-site/_site/* /usr/share/nginx/html